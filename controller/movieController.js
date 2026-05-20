// import productModel from "../models/productModel.js"
const fs = require("fs")
const slugify = require("slugify")
const movieModel = require("../models/movieModel.js")
const path = require("path")
const orderModel = require("../models/orderModel.js")
const userModel = require("../models/userModel.js")
const systemSettingsModel = require("../models/systemSettingsModel")
const rentalModel = require("../models/rentalModel")
const { getUploadPresignedUrl, getFileUrl } = require("../utils/s3")
const logAdminAction = require("../utils/auditLogger")
const maxSizeInBytes = 20 * 1024 * 1024 * 1024 // 20 GB



// Helper for streaming video
const streamVideo = async (req, res, fieldName) => {
  try {
    const movie = await movieModel.findById(req.params.pid).select(fieldName + " isPremium");
    if (!movie || !movie[fieldName]) {
      return res.status(404).send({ success: false, message: "Video not found" });
    }

    // Global Paywall Check
    const settings = await systemSettingsModel.findOne();
    const isPaywallGloballyEnabled = settings ? settings.paywallEnabled : true;

    // Only check subscription/rental if movie is premium AND paywall is globally enabled
    if (movie.isPremium && isPaywallGloballyEnabled) {
      const token = req.query.token || req.headers.authorization;
      if (!token) {
        return res.status(403).send({ success: false, message: "Login required to watch this content" });
      }
      try {
        const decode = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decode._id);

        // Admin (role 1) bypass
        if (user && user.role === 1) {
          // Bypass — admins can always watch
        } else {
          // Check active subscription
          const isExpired = user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date();
          const hasSubscription = user && user.subscription && !isExpired;

          // Check active rental
          const activeRental = await rentalModel.findOne({
            user: decode._id,
            movie: movie._id,
            expiresAt: { $gt: new Date() },
            "payment.success": true,
          });

          if (!hasSubscription && !activeRental) {
            return res.status(403).send({
              success: false,
              message: isExpired ? "Subscription has expired" : "Subscription or rental required",
            });
          }
        }
      } catch (err) {
        return res.status(403).send({ success: false, message: "Invalid or expired token" });
      }
    }

    // Check if the movie[fieldName] is already a full URL (R2)
    const videoUrl = movie[fieldName].startsWith("http")
      ? movie[fieldName]
      : path.join(process.cwd(), movie[fieldName]);

    if (movie[fieldName].startsWith("http")) {
      // If it's a remote URL (R2), redirect the user to watch it directly
      // This saves your Render.com bandwidth!
      return res.redirect(videoUrl);
    }

    if (!fs.existsSync(videoUrl)) {
      return res.status(404).send({ success: false, message: "File not found on server" });
    }

    const stat = fs.statSync(videoUrl);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while streaming video",
      error,
    });
  }
};

// };

// Generate Presigned URL for Admin Uploads
module.exports.getUploadUrlController = async (req, res) => {
  try {
    const { fileName, contentType, movieName } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).send({ success: false, message: "File name and type are required" });
    }
    const data = await getUploadPresignedUrl(fileName, contentType, movieName);
    res.status(200).send({
      success: true,
      ...data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error generating upload URL", error });
  }
};

module.exports.createMovieController = async (req, res) => {
  try {
    // const {
    //   // title,
    //   director,
    //   description,
    //   category,
    //   duration,
    //   language,
    //   contenttype,
    //   rating,
    //   cast,
    //   releaseDate,
    //   isPremium,
    // } = req.fields
    // const { poster, video, trailer } = req.files
    const { title, description, director, language, duration, category, contenttype, rating, cast, releaseDate, isPremium, isKids, introStart, introEnd } = req.fields;
    const { poster, video, trailer } = req.files;

    // Validation
    if (!title) return res.send({ error: "Title is Required" });
    if (!description) return res.send({ error: "Description is Required" });
    if (!director) return res.send({ error: "Director is Required" });
    if (!category) return res.send({ error: "Category is Required" });
    if (!contenttype) return res.send({ error: "ContentType is Required" });
    if (!poster && !req.fields.posterKey) return res.status(500).send({ error: "Poster is Required" });
    if (poster && poster.size > 5000000) return res.status(500).send({ error: "Poster should be less than 5MB" });
    if (!video && !req.fields.videoKey) return res.status(500).send({ error: "Video is Required" });

    const products = new movieModel({
      ...req.fields,
      slug: slugify(title),
      cast: cast ? cast.split(",").map(c => c.trim()) : [],
      isPremium: isPremium === "true",
      isKids: isKids === "true",
      introStart: introStart ? Number(introStart) : 0,
      introEnd: introEnd ? Number(introEnd) : 0,
    })

    if (poster) {
      const uploadDir = path.join(process.cwd(), "upload") // Path to the upload folder
      const uploadPath = path.join(uploadDir, poster.name) // Path to store the uploaded image

      // Move the image file to the upload folder
      await fs.promises.rename(poster.path, uploadPath)

      // Store the relative path of the image in the products document
      products.poster = `upload/${poster.name}`
    }
    if (video && video.size > maxSizeInBytes) {
      return res
        .status(500)
        .send({ error: "Video size should be less than 10 GB" })
    }
    // If the frontend sent an R2 key instead of a local file
    if (req.fields.videoKey) {
      products.video = getFileUrl(req.fields.videoKey);
    } else if (video) {
      const uploadDir = path.join(process.cwd(), "upload")
      const uploadPath = path.join(uploadDir, video.name)
      await fs.promises.rename(video.path, uploadPath)
      products.video = `upload/${video.name}`
    }

    if (req.fields.trailerKey) {
      products.trailer = getFileUrl(req.fields.trailerKey);
    } else if (trailer) {
      const uploadDir = path.join(process.cwd(), "upload")
      const uploadPath = path.join(uploadDir, trailer.name)
      await fs.promises.rename(trailer.path, uploadPath)
      products.trailer = `upload/${trailer.name}`
    }

    if (req.fields.posterKey) {
      products.poster = getFileUrl(req.fields.posterKey);
    } else if (poster) {
      const uploadDir = path.join(process.cwd(), "upload")
      const uploadPath = path.join(uploadDir, poster.name)
      await fs.promises.rename(poster.path, uploadPath)
      products.poster = `upload/${poster.name}`
    }

    if (req.files.subtitles) {
      const { subtitles } = req.files
      const uploadDir = path.join(process.cwd(), "upload")
      const uploadPath = path.join(uploadDir, subtitles.name)
      await fs.promises.rename(subtitles.path, uploadPath)
      products.subtitles = `upload/${subtitles.name}`
    }

    await products.save()
    
    // Log Action
    await logAdminAction(req.user._id, "CREATE_MOVIE", "Movie", `Created movie: ${title}`, { movieId: products._id }, req);

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    })
  }
}

//get all products
module.exports.getMovieController = async (req, res) => {
  try {
    const { kids } = req.query;
    const query = kids === "true" ? { isKids: true } : {};

    const movies = await movieModel
      .find(query)
      .populate("category")
      .populate("contenttype")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: movies.length,
      message: "ALlMovies ",
      movies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting movies",
      error: error.message,
    });
  }
};
// get single product
module.exports.getSingleMovieController = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = require("mongoose").Types.ObjectId.isValid(slug)
      ? { $or: [{ _id: slug }, { slug }] }
      : { slug };

    const movie = await movieModel
      .findOne(query)
      .populate("category")
      .populate("contenttype")

    res.status(200).send({
      success: true,
      message: "Single Movie Fetched",
      movie,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while getting single movie",
      error,
    })
  }
}

// get photo
module.exports.moviePosterController = async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.pid).select("poster")

    if (movie.poster) {
      if (movie.poster.startsWith("http")) {
        return res.redirect(movie.poster);
      }
      const posterPath = path.join(process.cwd(), movie.poster);

      // Read the poster file and send it as the response
      fs.readFile(posterPath, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send({
            success: false,
            message: "Error while reading poster",
            error: err,
          });
        } else {
          res.set("Content-Type", "image/jpeg");
          res.set("Cache-Control", "public, max-age=31536000, immutable"); // Cache for 1 year
          res.send(data);

        }
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Poster not found",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while getting poster",
      error,
    })
  }
}

module.exports.movieVideoController = async (req, res) => {
  await streamVideo(req, res, "video");
};
module.exports.movieTrailerController = async (req, res) => {
  await streamVideo(req, res, "trailer");
};

//delete controller
module.exports.deleteMovieController = async (req, res) => {
  try {
    await movieModel.findByIdAndDelete(req.params.pid)

    // Log Action
    await logAdminAction(req.user._id, "DELETE_MOVIE", "Movie", `Deleted movie ID: ${req.params.pid}`, {}, req);

    res.status(200).send({
      success: true,
      message: "Movie deleted successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while deleting movie",
      error,
    })
  }
}

// export const updateMovieController = async (req, res) => {
//   try {
//     const { title, director, description, contenttype, category } = req.body
//     const { poster } = req.files

//     switch (true) {
//       case !title:
//         return res.status(500).send({ error: "title is Required" })
//       case !director:
//         return res.status(500).send({ error: "Description is Required" })
//       case !description:
//         return res.status(500).send({ error: "Price is Required" })
//       case !category:
//         return res.status(500).send({ error: "Category is Required" })
//       case !contenttype:
//         return res.status(500).send({ error: "Quantity is Required" })
//       case poster && poster.size > 1000000:
//         return res
//           .status(500)
//           .send({ error: "photo is Required and should be less then 1mb" })
//     }

//     const movie = await movieModel.findByIdAndUpdate(
//       req.params.pid,
//       { ...req.fields, slug: slugify(title) },
//       { new: true }
//     )

//     if (poster) {
//       const uploadDir = path.join(process.cwd(), "upload")
//       const uploadPath = path.join(uploadDir, poster.name)

//       // Move the poster file to the upload folder
//       await fs.promises.rename(poster.path, uploadPath)

//       // Store the relative path of the poster in the movie document
//       movie.poster = `upload/${poster.name}`
//     }

//     await movie.save()

//     res.status(201).send({
//       success: true,
//       message: "Movie Updated Successfully",
//       movie,
//     })
//   } catch (error) {
//     console.log(error)
//     res.status(500).send({
//       success: false,
//       error,
//       message: "Error in updating movie",
//     })
//   }
// }
//upate producta
module.exports.updateMovieController = async (req, res) => {
  try {
    const {
      title,
      director,
      description,
      duration,
      language,
      trailer,
      category,
      contenttype,
      rating,
      cast,
      releaseDate,
      isPremium,
      isKids,
      introStart,
      introEnd,
    } = req.fields;
    const { poster, video } = req.files;

    // Validation
    if (!title) return res.status(400).send({ error: "Title is Required" });
    if (!director) return res.status(400).send({ error: "Director is Required" });
    if (!description) return res.status(400).send({ error: "Description is Required" });
    if (!duration) return res.status(400).send({ error: "Duration is Required" });
    if (!language) return res.status(400).send({ error: "Language is Required" });
    if (!category) return res.status(400).send({ error: "Category is Required" });
    if (!contenttype) return res.status(400).send({ error: "Content Type is Required" });

    if (poster && poster.size > 5000000) {
      return res.status(400).send({ error: "Poster should be less than 5MB" });
    }

    const products = await movieModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(title),
        cast: cast ? cast.split(",").map((c) => c.trim()) : [],
        isPremium: isPremium === "true" || isPremium === true,
        isKids: isKids === "true" || isKids === true,
        introStart: introStart ? Number(introStart) : 0,
        introEnd: introEnd ? Number(introEnd) : 0,
      },
      { new: true }
    );
    if (!products) {
      return res.status(404).send({ error: "Product not found" })
    }
    if (poster) {
      const uploadDir = path.join(process.cwd(), "upload") // Path to the upload folder
      const uploadPath = path.join(uploadDir, poster.name) // Path to store the uploaded image

      // Move the image file to the upload folder
      await fs.promises.rename(poster.path, uploadPath)

      // Store the relative path of the image in the products document
      products.poster = `upload/${poster.name}`
    }
    if (video) {
      const uploadDir = path.join(process.cwd(), "upload")
      const uploadPath = path.join(uploadDir, video.name)

      // Move the video file to the upload folder
      await fs.promises.rename(video.path, uploadPath)

      // Store the relative path of the video in the movie document
      products.video = `upload/${video.name}`
    }

    // const products = await movieModel.findByIdAndUpdate(
    //   req.params.pid,
    //   { ...req.fields, slug: slugify(title) },
    //   { new: true }
    // )
    // if (photo) {
    //   products.photo.data = fs.readFileSync(photo.path)
    //   products.photo.contentType = photo.type
    // }
    await products.save()

    // Log Action
    await logAdminAction(req.user._id, "UPDATE_MOVIE", "Movie", `Updated movie: ${title}`, { movieId: products._id }, req);

    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte product",
    })
  }
}

const movieCategoryController = async (req, res) => {
  try {
    const category = await require("../models/categoryModel").findOne({ slug: req.params.slug });
    const { kids } = req.query;
    const query = { category: category._id };
    if (kids === "true") query.isKids = true;

    const movies = await movieModel.find(query).populate("category");
    res.status(200).send({
      success: true,
      category,
      movies,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Getting movie",
      error,
    });
  }
};

module.exports.movieCategoryController = movieCategoryController;

//search movies
module.exports.movieSearchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    
    // Fuzzy search: allow characters in between (handles skipping letters)
    const fuzzyRegex = keyword.split("").join(".*");
    
    const results = await movieModel
      .find({
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { title: { $regex: fuzzyRegex, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { director: { $regex: keyword, $options: "i" } },
          { cast: { $regex: keyword, $options: "i" } }
        ],
      })
      .select("-poster -video -trailer") // Exclude heavy fields
      .populate("category");
      
    res.json(results);
    console.log(`Search for "${keyword}" returned ${results.length} results`);

  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: "error in search movie",
      error,
    })
  }
}

module.exports.relatedMovieController = async (req, res) => {
  try {
    const { pid, cid } = req.params
    const movies = await movieModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-poster")
      .limit(3)
      .populate("category")
    res.status(200).send({
      success: true,
      movies,
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      message: "error in related movies",
      error,
    })
  }
}

module.exports.movieSubtitlesController = async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.pid).select("subtitles");
    if (!movie || !movie.subtitles) {
      return res.status(404).send({ success: false, message: "Subtitles not found" });
    }
    if (movie.subtitles.startsWith("http")) {
      return res.redirect(movie.subtitles);
    }
    const subPath = path.join(process.cwd(), movie.subtitles);
    if (!fs.existsSync(subPath)) {
      return res.status(404).send({ success: false, message: "Subtitle file missing" });
    }
    res.set("Content-Type", "text/vtt");
    fs.createReadStream(subPath).pipe(res);
  } catch (error) {
    res.status(500).send({ success: false, message: "Error serving subtitles", error });
  }
}
// module.exports = {
//   createMovieController,
//   getMovieController,
//   getSingleMovieController,
//   moviePosterController,
//   movieVideoController,
//   movieTrailerController,
//   deleteMovieController,
//   updateMovieController,
//   movieSearchController,
//   relatedMovieController,
// }

