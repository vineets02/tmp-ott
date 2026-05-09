import React from "react"
import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"

const OrderGraph = () => {
  const [graphData, setGraphData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetch(
          "https://tmp-h86h.onrender.com/api/v1/auth/get-orders/"
        ) // Replace with your API endpoint
        // const orders = await response.jso
        // n()
        

        if (data && data.length > 0) {
          const labels = data.map((order) => order._id)
          const data = data.map((order) => order.totalAmount)

          const graphData = {
            labels,
            datasets: [
              {
                label: "Total Amount",
                data,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
              },
            ],
          }
          setGraphData(graphData)
        }
      } catch (error) {
        
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {Object.keys(graphData).length > 0 ? (
        <Bar data={graphData} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default OrderGraph
