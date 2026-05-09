import { all, call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import config from '../../config';
import { setAuth } from '../slices/authSlice';
import { clearRent } from '../slices/rentSlice';
import Swal from 'sweetalert2';

// API Calls
const processPaymentAPI = async (payload) => {
  const { amount } = payload;
  return await axios.post(`${config.API_BASE_URL}/api/v1/payment/orders`, { amount });
};

const verifyPaymentAPI = async (response) => {
  return await axios.post(`${config.API_BASE_URL}/api/v1/payment/verify`, { response });
};

const loginAPI = async (payload) => {
  return await axios.post(`${config.API_BASE_URL}/api/v1/auth/login`, payload);
};

// Worker Sagas
function* handlePaymentCheckout(action) {
  try {
    const { amount, onSuccess, rentList } = action.payload;
    
    // 1. Create order on backend
    const orderRes = yield call(processPaymentAPI, { amount });
    if (orderRes.data.code !== 200) {
      throw new Error("Failed to create order");
    }
    const orderData = orderRes.data.data;

    // 2. Load Razorpay options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_DiJk5T6Kc6ampr",
      amount: orderData.amount,
      currency: "INR",
      name: "TMP OTT Platform",
      description: "Content Purchase",
      order_id: orderData.id,
      handler: async function (response) {
        try {
          // 3. Verify Payment Signature
          const verifyRes = await verifyPaymentAPI(response);
          if (verifyRes.data.code === 200) {
            Swal.fire("Success", "Payment Verified & Successful", "success");
            if (onSuccess) onSuccess();
          } else {
            Swal.fire("Error", "Payment Verification Failed", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Error during verification", "error");
        }
      },
      prefill: {
        name: "User",
        email: "user@example.com",
      },
      theme: {
        color: "#f59e0b", // Amber 500
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    
    rzp.on("payment.failed", function (response) {
      Swal.fire("Payment Failed", response.error.description, "error");
    });

  } catch (error) {
    
    Swal.fire("Error", "Could not initiate payment", "error");
  }
}

function* handleLogin(action) {
  try {
    const { payload, navigate } = action.payload;
    const res = yield call(loginAPI, payload);
    if (res.data.success) {
      Swal.fire("Success", res.data.message || "Logged in successfully", "success");
      yield put(setAuth({ user: res.data.user, token: res.data.token }));
      if (navigate) navigate(res.data?.user?.role === 1 ? "/dashboard/admin" : "/profiles");
    } else {
      Swal.fire("Error", res.data.message || "Invalid credentials", "error");
    }
  } catch (error) {
    
    Swal.fire("Error", "Something went wrong", "error");
  }
}

// Watcher Sagas
export function* watchPayment() {
  yield takeLatest('payment/checkout', handlePaymentCheckout);
}

export function* watchAuth() {
  yield takeLatest('auth/loginRequest', handleLogin);
}

// Root Saga
export default function* rootSaga() {
  yield all([
    watchPayment(),
    watchAuth(),
  ]);
}
