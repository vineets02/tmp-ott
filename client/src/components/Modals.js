import { AiFillCloseCircle } from "react-icons/ai"

const Modals = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="modal ">
      <div className="modal-content">
        <div className="flex z-50  absolute mt-0  ">
          <button onClick={onClose} className="">
            <AiFillCloseCircle size={25} className="" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modals
