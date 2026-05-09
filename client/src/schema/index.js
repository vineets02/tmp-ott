import * as Yup from "yup"

export const signUpSchema = Yup.object({
  name: Yup.string()
    .min(3, "Username must be at least 3 characters long")
    .max(25, "Username can be at most 25 characters long")
    .required("Please enter your username"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Please enter your email"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Please enter your password"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Please enter a valid 10-digit phone number")
    .required("Please enter your phone number"),
  question: Yup.string().required("please enter your question"),
})

export const GenreSchema = Yup.object({
  contenttype: Yup.string().required("please enter genre"),
})

export const movieSchema = Yup.object().shape({
  title: Yup.string().required("Movie Title is required"),
  director: Yup.string().required("Director is required"),
  description: Yup.string().required("Movie Brief is required"),
  contenttype: Yup.string().required("Content Type is required"),
  category: Yup.string().required("Movie Genre is required"),
})
