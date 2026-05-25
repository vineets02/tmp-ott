const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const movieModel = require("../models/movieModel");
const rentalModel = require("../models/rentalModel");

/**
 * GET /api/v1/admin/analytics/overview
 * Returns all KPI data for the analytics dashboard in a single request
 */
module.exports.getAnalyticsOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOf30Days = new Date(now);
    startOf30Days.setDate(startOf30Days.getDate() - 29);
    startOf30Days.setHours(0, 0, 0, 0);

    const startOf12Months = new Date(now);
    startOf12Months.setMonth(startOf12Months.getMonth() - 11);
    startOf12Months.setDate(1);
    startOf12Months.setHours(0, 0, 0, 0);

    // --- Run all aggregations in parallel for speed ---
    const [
      revenueLast30Days,
      revenueByMonth,
      topContent,
      userStats,
      rentalRevenue,
      rentalByMonth
    ] = await Promise.all([

      // 1. Revenue by day for last 30 days (from successful orders)
      orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOf30Days },
            "payment.razorpay_payment_id": { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            revenue: {
              $sum: { $ifNull: [{ $divide: ["$payment.amount", 100] }, 199] }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 2. Revenue by month for last 12 months
      orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOf12Months },
            "payment.razorpay_payment_id": { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" }
            },
            revenue: {
              $sum: { $ifNull: [{ $divide: ["$payment.amount", 100] }, 199] }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 3. Top 10 most watched movies (by aggregating all user history)
      userModel.aggregate([
        { $unwind: "$history" },
        {
          $group: {
            _id: "$history.movie",
            playCount: { $sum: 1 },
            totalWatchTime: { $sum: "$history.progress" }
          }
        },
        { $sort: { playCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie"
          }
        },
        { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            playCount: 1,
            totalWatchTime: 1,
            title: "$movie.title",
            poster: "$movie.poster",
            slug: "$movie.slug",
            isPremium: "$movie.isPremium"
          }
        }
      ]),

      // 4. User statistics
      userModel.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            activeSubscribers: [
              {
                $match: {
                  subscription: true,
                  $or: [
                    { subscriptionEndDate: { $gt: new Date() } },
                    { subscriptionEndDate: null }
                  ]
                }
              },
              { $count: "count" }
            ],
            expiredSubscribers: [
              {
                $match: {
                  subscription: true,
                  subscriptionEndDate: { $lte: new Date() }
                }
              },
              { $count: "count" }
            ],
            newUsersThisMonth: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1)
                  }
                }
              },
              { $count: "count" }
            ],
            // Monthly signups for growth chart
            signupsByMonth: [
              { $match: { createdAt: { $gte: startOf12Months } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$createdAt" }
                  },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),

      // 5. Rental revenue total and by movie
      rentalModel.aggregate([
        { $match: { "payment.success": true } },
        {
          $group: {
            _id: "$movie",
            totalRevenue: { $sum: "$payment.amount" },
            rentalCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie"
          }
        },
        { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            totalRevenue: 1,
            rentalCount: 1,
            title: "$movie.title",
            poster: "$movie.poster"
          }
        }
      ]),

      // 6. Rental revenue by month
      rentalModel.aggregate([
        {
          $match: {
            "payment.success": true,
            createdAt: { $gte: startOf12Months }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$payment.amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Flatten facet results
    const userFacet = userStats[0] || {};
    const totalUsers = userFacet.totalUsers?.[0]?.count || 0;
    const activeSubscribers = userFacet.activeSubscribers?.[0]?.count || 0;
    const expiredSubscribers = userFacet.expiredSubscribers?.[0]?.count || 0;
    const newUsersThisMonth = userFacet.newUsersThisMonth?.[0]?.count || 0;
    const signupsByMonth = userFacet.signupsByMonth || [];

    // Calculate totals
    const totalSubscriptionRevenue = revenueByMonth.reduce((a, b) => a + b.revenue, 0);
    const totalRentalRevenue = rentalRevenue.reduce((a, b) => a + b.totalRevenue, 0);
    const totalWatchTimeSeconds = topContent.reduce((a, b) => a + (b.totalWatchTime || 0), 0);
    const churnRate = activeSubscribers + expiredSubscribers > 0
      ? Math.round((expiredSubscribers / (activeSubscribers + expiredSubscribers)) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeSubscribers,
          expiredSubscribers,
          churnRate,
          newUsersThisMonth,
          totalSubscriptionRevenue: Math.round(totalSubscriptionRevenue),
          totalRentalRevenue: Math.round(totalRentalRevenue),
          totalRevenue: Math.round(totalSubscriptionRevenue + totalRentalRevenue),
          totalWatchTimeHours: Math.round(totalWatchTimeSeconds / 3600)
        },
        revenueLast30Days,
        revenueByMonth,
        rentalByMonth,
        topContent,
        topRentals: rentalRevenue,
        signupsByMonth
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Analytics aggregation failed", error: error.message });
  }
};

/**
 * GET /api/v1/admin/analytics/movie/:movieId
 * Returns detailed viewer retention, active count, and ledger for a single movie
 */
module.exports.getMovieWatchInsights = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Helper: Translate HH:MM:SS or minutes to seconds
    const parseDurationToSeconds = (durationStr) => {
      if (!durationStr) return 7200;
      const parts = durationStr.toString().toLowerCase().replace("min", "").trim().split(":");
      if (parts.length === 3) {
        return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
      } else if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      const mins = parseInt(parts[0], 10);
      if (!isNaN(mins)) return mins * 60;
      return 7200;
    };

    const durationInSeconds = parseDurationToSeconds(movie.duration);

    // Fetch all users containing this movie in main history or any profile's history
    const users = await userModel.find({
      $or: [
        { "history.movie": movieId },
        { "profiles.history.movie": movieId }
      ]
    }).select("name email history profiles");

    let totalUniqueViewers = 0;
    let totalActiveNow = 0;
    let totalWatchTimeSeconds = 0;
    const deciles = Array(10).fill(0); // For 10%, 20%, ..., 100% completion
    const viewerLedger = [];

    const processItem = (user, item, profileName = "Primary Account") => {
      totalUniqueViewers++;
      const progress = item.progress || 0;
      totalWatchTimeSeconds += progress;

      // Active status (updated progress in the last 5 minutes)
      const lastActive = new Date(item.watchedAt || user.updatedAt || new Date());
      const isCurrentlyActive = (new Date() - lastActive) < 5 * 60 * 1000;
      if (isCurrentlyActive) totalActiveNow++;

      const completionPercentage = durationInSeconds > 0 
        ? Math.min(Math.round((progress / durationInSeconds) * 100), 100)
        : 0;

      // Update decile milestones reached
      for (let i = 1; i <= 10; i++) {
        if (completionPercentage >= i * 10) {
          deciles[i - 1]++;
        }
      }

      let status = "Paused";
      if (isCurrentlyActive) status = "Watching Now";
      else if (completionPercentage >= 90) status = "Finished";

      viewerLedger.push({
        userName: user.name,
        email: user.email,
        profileName,
        progress,
        completionPercentage,
        lastWatched: item.watchedAt || user.updatedAt || new Date(),
        status
      });
    };

    users.forEach(user => {
      // Check main history
      const mainMatch = user.history.find(h => h.movie && h.movie.toString() === movieId);
      if (mainMatch) {
        processItem(user, mainMatch);
      }

      // Check profiles
      if (user.profiles && user.profiles.length > 0) {
        user.profiles.forEach(profile => {
          if (profile.history) {
            const profileMatch = profile.history.find(h => h.movie && h.movie.toString() === movieId);
            if (profileMatch) {
              processItem(user, profileMatch, profile.name);
            }
          }
        });
      }
    });

    const averageProgressPercent = totalUniqueViewers > 0 
      ? Math.round(viewerLedger.reduce((acc, v) => acc + v.completionPercentage, 0) / totalUniqueViewers)
      : 0;

    res.status(200).json({
      success: true,
      movie: {
        title: movie.title,
        duration: movie.duration,
        durationSeconds: durationInSeconds,
        poster: movie.poster
      },
      stats: {
        totalUniqueViewers,
        totalActiveNow,
        averageProgressPercent,
        averageWatchTimeSeconds: totalUniqueViewers > 0 ? Math.round(totalWatchTimeSeconds / totalUniqueViewers) : 0,
        retentionChartData: deciles.map((count, index) => ({
          milestone: `${(index + 1) * 10}%`,
          count,
          percentage: totalUniqueViewers > 0 ? Math.round((count / totalUniqueViewers) * 100) : 0
        })),
        viewerLedger: viewerLedger.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
      }
    });

  } catch (error) {
    console.error("Movie Watch Insights error:", error);
    res.status(500).json({ success: false, message: "Error compiling watch insights", error: error.message });
  }
};

