import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import config from "../config";
import { BiSend, BiUserCircle, BiGroup, BiCopy } from "react-icons/bi";
import Swal from "sweetalert2";

const socket = io(config.API_BASE_URL.replace("/api/v1", "")); // Connect to root for socket

export default function WatchParty({ movieId, movieTitle, player, auth }) {
  const [roomId, setRoomId] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("on_sync_play", () => {
      if (player) player.play();
    });

    socket.on("on_sync_pause", () => {
      if (player) player.pause();
    });

    socket.on("on_sync_seek", (data) => {
      if (player) player.currentTime(data.time);
    });

    return () => {
      socket.off("receive_message");
      socket.off("on_sync_play");
      socket.off("on_sync_pause");
      socket.off("on_sync_seek");
    };
  }, [player]);

  // Sync player events to others
  useEffect(() => {
    if (!player || !inRoom) return;

    const onPlay = () => socket.emit("sync_play", { roomId });
    const onPause = () => socket.emit("sync_pause", { roomId });
    const onSeek = () => socket.emit("sync_seek", { roomId, time: player.currentTime() });

    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("seeked", onSeek);

    return () => {
      player.off("play", onPlay);
      player.off("pause", onPause);
      player.off("seeked", onSeek);
    };
  }, [player, inRoom, roomId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleJoinRoom = () => {
    if (!roomId) return Swal.fire("Error", "Please enter a Room ID", "error");
    socket.emit("join_room", roomId);
    setInRoom(true);
    Swal.fire("Joined!", `You are now in Watch Party: ${roomId}`, "success");
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    setRoomId(newRoomId);
    socket.emit("join_room", newRoomId);
    setInRoom(true);
    Swal.fire("Room Created!", `Share this ID with friends: ${newRoomId}`, "success");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;

    const msgData = {
      roomId,
      user: auth?.user?.name || "Anonymous",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit("send_message", msgData);
    setNewMessage("");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    Swal.fire({ title: "Copied!", timer: 1000, showConfirmButton: false });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
      {!inRoom ? (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
            <BiGroup size={48} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Start a Watch Party</h3>
            <p className="text-zinc-500 text-sm mt-2">Watch "{movieTitle}" synchronized with friends!</p>
          </div>
          
          <div className="w-full space-y-3">
            <button 
              onClick={handleCreateRoom}
              className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-lg"
            >
              CREATE NEW ROOM
            </button>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] text-zinc-600 font-black uppercase">OR</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Room ID" 
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-sm outline-none focus:border-amber-500 transition-all"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              />
              <button 
                onClick={handleJoinRoom}
                className="px-6 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
            <div className="flex items-center gap-3">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Live Room: {roomId}</span>
            </div>
            <button onClick={copyRoomId} className="text-zinc-500 hover:text-white transition-colors">
               <BiCopy size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.user === auth?.user?.name ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">{m.user}</span>
                  <span className="text-[8px] text-zinc-600">{m.time}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                  m.user === auth?.user?.name 
                    ? "bg-amber-500 text-black font-medium rounded-tr-none" 
                    : "bg-zinc-800 text-zinc-200 rounded-tl-none"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-zinc-500 text-xs">
                 <BiSend size={32} className="mb-2" />
                 Say hi to your friends!
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/80 border-t border-zinc-800">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="p-3 bg-amber-500 text-black rounded-xl hover:scale-105 transition-all shadow-lg">
                <BiSend size={20} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
