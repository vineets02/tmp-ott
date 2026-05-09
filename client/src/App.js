import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import WebShows from "./pages/WebShows"
import Dashboard from "./pages/user/Dashboard"
import PrivateRoute from "./components/route/private"
import ForgotPassword from "./pages/auth/ForgotPassword"
import AdminRoute from "./components/route/AdminRoutes"
import AdminDashboard from "./pages/admin/AdminDashboard"
import PageNotFound from "./pages/PageNotFound"
import Webshows from "./pages/admin/Webshows"
import Movies from "./pages/admin/movies/Movies"
import Movie from "./pages/Movie"
import Exclusive from "./pages/Exclusive"
import Genres from "./pages/admin/genre/Genres"
import AddMovies from "./pages/admin/movies/AddMovies"
import EditMovie from "./pages/admin/movies/EditMovie"
import AddGenre from "./pages/admin/genre/AddGenre"
import EditGenre from "./pages/admin/genre/EditGenre"
import ContentType from "./pages/contentType/ContentType"
import AddContentType from "./pages/contentType/AddContentType"
import EditContentType from "./pages/contentType/EditContentType"
import MovieDetails from "./pages/admin/movies/MovieDetails"
import StaffManagement from "./pages/admin/StaffManagement"
import ProfilesPage from "./pages/auth/ProfilesPage"
import WatchlistPage from "./pages/WatchlistPage"
import SearchPage from "./pages/SearchPage"
import RentPage from "./pages/RentPage"
import CategoryPage from "./pages/CategoryPage"
import CategoryMoviesPage from "./pages/CategoryMoviesPage"
import OrderPage from "./pages/user/OrderPage"
import AllOrders from "./pages/admin/AllOrders"
import PaymentSuccess from "./components/PaymentSuccess"
import ChangePassword from "./pages/auth/ChangePassword"
import AboutUs from "./pages/AboutUs"
import ContactUs from "./pages/ContactUs"
import SubscriptionPage from "./pages/SubscriptionPage"
import Analytics from "./pages/admin/Analytics"
import UserManagement from "./pages/admin/UserManagement"
import HomepageControl from "./pages/admin/HomepageControl"
import SubscriptionManager from "./pages/admin/SubscriptionManager"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/movie/:slug" element={<MovieDetails />} />
        <Route path="/search/:keyword" element={<SearchPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/category/:slug" element={<CategoryMoviesPage />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/originals" element={<WebShows />} />
        <Route path="/branded-content" element={<Exclusive />} />

        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route path="user" element={<Dashboard />} />
          <Route path="user/change-password" element={<ChangePassword />} />
          <Route path="user/rent" element={<RentPage />} />
          <Route path="user/orders" element={<OrderPage />} />
        </Route>
        <Route path="/dashboard" element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/movies" element={<Movies />} />
          <Route path="admin/allorders" element={<AllOrders />} />
          <Route path="admin/addmovie" element={<AddMovies />} />
          <Route path="admin/edit-movie/:slug" element={<EditMovie />} />
          <Route path="admin/genre" element={<Genres />} />
          <Route path="admin/addgenre" element={<AddGenre />} />
          <Route path="admin/edit-genre/:slug" element={<EditGenre />} />

          <Route path="admin/contenttype" element={<ContentType />} />
          <Route path="admin/addcontenttype" element={<AddContentType />} />
          <Route
            path="admin/edit-contenttype/:slug"
            element={<EditContentType />}
          />

          <Route path="admin/webshows" element={<Webshows />} />
          <Route path="admin/exclusive" element={<Exclusive />} />
          <Route path="admin/analytics" element={<Analytics />} />
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/staff" element={<StaffManagement />} />
          <Route path="admin/homepage" element={<HomepageControl />} />
          <Route path="admin/subscription-manager" element={<SubscriptionManager />} />
          <Route path="admin/genres" element={<Genres />} />
        </Route>

        <Route path="/signup" element={<Signup />} />
        <Route path="/exclusive" element={<Exclusive />} />
        <Route path="/movies" element={<Movie />} />
        <Route path="/webshows" element={<WebShows />} />
      </Routes>
    </>
  )
}

export default App
