const { userProgressSummaryModel } = require("../models/userProgressSummaryModel")
const { clientHistoryModel } = require("../models/historyModel")
const { scheduleOptimaModel } = require("../models/ScheduleOptima")
const { userDailyProgress, userWeeklyProgress, userMonthlyProgress, userGraphModel } = require("../models/UserDailyProgress")
const cron = require("node-cron")
const moment = require("moment-timezone")

const TodaysDate = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`
}
const createUserProgress = async (req, res) => {
    try {
        const todaydate = new Date().toLocaleDateString("en-GB");
        const taskTypes = [
            "demo_db",
            "installation_db",
            "leads_db",
            "recovery_db",
            "follow_up_db",
            "support_db",
            "training_db",
            "target_db",
            "no_of_new_calls_db",
            "new_data_db",
        ]

        for (const taskType of taskTypes) {
            const completeField = `tracking_db.${taskType}.completed`;
            const completeDateField = `tracking_db.${taskType}.completedDate`

            const aggregationResult = await clientHistoryModel.aggregate([
                {
                    $match: {
                        [completeField]: true,
                        [completeDateField]: todaydate,
                    }
                },
                {
                    $group: {
                        _id: "$assignTo",
                        count: { $sum: 1 },
                    }
                }
            ])

            for (const row of aggregationResult) {
                const userId = row._id;
                const count = row.count;

                await userProgressSummaryModel.findOneAndUpdate(
                    {
                        userId_db: userId,
                        date_db: todaydate,
                        taskType_db: taskType,

                    },
                    {
                        $set: {
                            totalCompleted_db: count,
                        },
                    },
                    {
                        upsert: true,
                        new: true,
                    }
                )
            }

        }
        res.status(200).json({ message: "User progress summary generated", date: todaydate })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//GET USER PROGRESS ROUTES
const getUserDailyReport = async (req, res) => {
    try {
        const id = req.params.id;
        const today = new Date().toLocaleDateString("en-GB");
        const result = await userDailyProgress.find({ userId_db: id, date_db: today })
        console.log("result", result)
        res.status(200).json({ message: "user data", result })

    } catch (err) {
        console.log({ message: "internale error", err: err.message })
        res.status(500).json({ message: "internal error", err })
    }
}

//GET USER GRAPH REPORT
const getUserGraphReport = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await userGraphModel.findOne({ userId_db: userId })
        console.log("user graph report", result)
        res.status(200).json({ message: "user graph report", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//GET COUNT FROM CLIENT HISTORY DB USING MATCH AND GROUP
cron.schedule('* * * * *', async () => {
    try {
        const todayDate = new Date().toLocaleDateString("en-GB");

        const taskTypes = {
            "demo_db": "demo_completed_db",
            "installation_db": "installation_completed_db",
            "support_db": "support_completed_db",
            "recovery_db": "recovery_completed_db",
            "no_of_new_calls_db": "no_of_new_calls_completed_db",
            "follow_up_db": "followup_completed_db",
        }

        for (const [taskType, taskField] of Object.entries(taskTypes)) {
            const completeField = `tracking_db.${taskType}.completed`;
            const completeDateField = `tracking_db.${taskType}.completedDate`;

            const aggregationResult = await clientHistoryModel.aggregate([
                {
                    $match: {
                        [completeField]: true,
                        [completeDateField]: todayDate
                    }
                },
                {
                    $unwind: "$product_db"
                },
                {
                    $group: {
                        _id: {
                            userId: "$assignTo",
                            product: "$product_db.value"
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
            // console.log("aggragateREsult", aggregationResult)
            for (const row of aggregationResult) {
                const userId = row._id.userId;
                const product = row._id.product;
                const count = row.count;

                await userProgressSummaryModel.updateOne(
                    {
                        userId_db: userId,
                        date_db: todayDate,
                        product_db: product,
                    },
                    {
                        $set: {
                            [taskField]: count > 0 ? count : 0
                        }
                    },
                    { upsert: true, new: true }
                );
            }
        }
        console.log("✅ CRON: User progress summary generated for", todayDate);
    } catch (err) {
        console.error("❌ CRON error:", err.message);
    }
});

//CRON JOB USED FOR TOTAL ASSIGNED VALUES IN USERPROGRESSMODEL
cron.schedule("* * * * *", async (req, res) => {
    try {
        const today = new Date().toLocaleDateString("en-GB")
        const taskTypes = {
            "demo_db": "demo_assigned_db",
            "installation_db": "installation_assigned_db",
            "support_db": "support_assigned_db",
            "recovery_db": "recovery_assigned_db",
            "no_of_new_calls_db": "no_of_new_calls_assigned_db",
            "target_db": "target_assigned_db",
        }
        const schedules = await scheduleOptimaModel.find({ date_todo_db: today })
        // console.log("schedules", schedules)

        for (const scheduleDoc of schedules) { //
            const schedule = scheduleDoc.toObject();
            const userId = schedule.userId_db;
            const goalsMap = JSON.parse(JSON.stringify(Object.fromEntries(schedule.goals_db)));
            // console.log("gaolsMap",goalsMap)

            for (const product in goalsMap) {
                // console.log("product",product)
                const tasks = goalsMap[product]
                // console.log("tasks = >",tasks)
                for (const [taskType, taskField] of Object.entries(tasks)) {
                    const taskName = taskTypes[taskType]
                    // console.log("taskName =>", taskName)
                    const assigned_db = taskField?.assigned_db;
                    // console.log("assigned_db = >", assigned_db)

                    await userProgressSummaryModel.findOneAndUpdate(
                        {
                            userId_db: userId,
                            date_db: new Date().toLocaleDateString("en-GB"),
                            product_db: product,
                        },
                        { $set: { [taskName]: assigned_db } },
                        { upsert: true }
                    )

                }
            }
        }
        console.log("✅ CRON: Total assigned goals updated for", today);
    } catch (err) {
        console.log("internal error", err)
    }
})

//CRON JOB USED FOR DIALY REPORT OF GAOLS LIKE INSTALLTION, DEMO...
cron.schedule("* * * * *", async () => {
    try {
        const today = new Date().toLocaleDateString("en-GB")
        const userProgress = await userProgressSummaryModel.find({ date_db: today })
        // console.log("userProgress",userProgress)
        const userData = {}
        for (const userDoc of userProgress) {
            const userId = userDoc.userId_db

            if (!userData[userId]) {
                userData[userId] = {
                    totalAssignDemo: 0,
                    totalAssignInstallation: 0,
                    totalAssignNewCall: 0,
                    totalAssignRecovery: 0,
                    totalAssignSupport: 0,
                    totalAssignTarget: 0,

                    totalCompleteDemo: 0,
                    totalCompleteInstallation: 0,
                    totalCompleteNewCall: 0,
                    totalCompleteRecovery: 0,
                    totalCompleteSupport: 0,
                    totalCompleteTarget: 0,
                }
            }

            userData[userId].totalAssignDemo += userDoc.demo_assigned_db
            userData[userId].totalAssignInstallation += userDoc.installation_assigned_db
            userData[userId].totalAssignNewCall += userDoc.no_of_new_calls_assigned_db
            userData[userId].totalAssignRecovery += userDoc.recovery_assigned_db
            userData[userId].totalAssignSupport += userDoc.support_assigned_db
            userData[userId].totalAssignTarget += userDoc.target_assigned_db

            userData[userId].totalCompleteDemo += userDoc.demo_completed_db
            userData[userId].totalCompleteInstallation += userDoc.installation_completed_db
            userData[userId].totalCompleteNewCall += userDoc.no_of_new_calls_completed_db
            userData[userId].totalCompleteRecovery += userDoc.recovery_completed_db
            userData[userId].totalCompleteSupport += userDoc.support_completed_db
            userData[userId].totalCompleteTarget += userDoc.target_completed_db
        }
        for (const userId in userData) {
            const {
                totalAssignDemo,
                totalAssignInstallation,
                totalAssignNewCall,
                totalAssignRecovery,
                totalAssignSupport,
                totalAssignTarget,

                totalCompleteDemo,
                totalCompleteInstallation,
                totalCompleteNewCall,
                totalCompleteRecovery,
                totalCompleteSupport,
                totalCompleteTarget,
            } = userData[userId]

            // console.log("yo userData",userId,"-", userData[userId])
            const result = await userDailyProgress.findOneAndUpdate(
                { userId_db: userId, date_db: today },
                {
                    $set: {
                        daily_demo_assigned_db: totalAssignDemo,
                        daily_demo_completed_db: totalCompleteDemo,

                        daily_installation_assigned_db: totalAssignInstallation,
                        daily_installation_completed_db: totalCompleteInstallation,

                        daily_no_of_new_calls_assigned_db: totalAssignNewCall,
                        daily_no_of_new_calls_completed_db: totalCompleteNewCall,

                        daily_recovery_assigned_db: totalAssignRecovery,
                        daily_recovery_completed_db: totalCompleteRecovery,

                        daily_support_assigned_db: totalAssignSupport,
                        daily_support_completed_db: totalCompleteSupport,

                        daily_target_assigned_db: totalAssignTarget,
                        daily_target_completed_db: totalCompleteTarget,
                    }
                },
                { upsert: true, new: true }
            )
            // console.log("✅ CRON: User Daily Progress is",result);
        }


        console.log("✅ CRON: User Daily Progress generated for", today);
    } catch (err) {
        console.log("internal erro in cron", err)
    }
})

// CRON JOB USER FOR WEEKLY REPORT
cron.schedule("* * * * *", async () => {
    try {
        const lastSevenDay = new Date()
        lastSevenDay.setDate(lastSevenDay.getDate() - 6);
        // console.log("lastSevenDay", lastSevenDay)

        const weeklyProgress = await userDailyProgress.aggregate(
            [
                {
                    $match: {
                        createdAt: { $gte: lastSevenDay },
                    }
                },
                {
                    $group: {
                        _id: "$userId_db",
                        weekly_installation_assigned_db: { $sum: "$daily_installation_assigned_db" },
                        weekly_installation_completed_db: { $sum: "$daily_installation_completed_db" },

                        weekly_demo_assigned_db: { $sum: "$daily_demo_assigned_db" },
                        weekly_demo_completed_db: { $sum: "$daily_demo_completed_db" },

                        weekly_recovery_assigned_db: { $sum: "$daily_recovery_assigned_db" },
                        weekly_recovery_completed_db: { $sum: "$daily_recovery_completed_db" },

                        weekly_support_assigned_db: { $sum: "$daily_support_assigned_db" },
                        weekly_support_completed_db: { $sum: "$daily_support_completed_db" },

                        weekly_target_assigned_db: { $sum: "$daily_target_assigned_db" },
                        weekly_target_completed_db: { $sum: "$daily_target_completed_db" },

                        weekly_no_of_new_calls_assigned_db: { $sum: "$daily_no_of_new_calls_assigned_db" },
                        weekly_no_of_new_calls_completed_db: { $sum: "$daily_no_of_new_calls_completed_db" },

                    }
                }
            ]
        )
        // console.log("weekly", weeklyProgress)
        for (const doc of weeklyProgress) {
            await userWeeklyProgress.findOneAndUpdate(
                { userId_db: doc._id },
                {
                    $set: {
                        weekly_installation_assigned_db: doc.weekly_installation_assigned_db,
                        weekly_installation_completed_db: doc.weekly_installation_completed_db,

                        weekly_demo_assigned_db: doc.weekly_demo_assigned_db,
                        weekly_demo_completed_db: doc.weekly_demo_completed_db,

                        weekly_recovery_assigned_db: doc.weekly_recovery_assigned_db,
                        weekly_recovery_completed_db: doc.weekly_recovery_completed_db,

                        weekly_support_assigned_db: doc.weekly_support_assigned_db,
                        weekly_support_completed_db: doc.weekly_support_completed_db,

                        weekly_target_assigned_db: doc.weekly_target_assigned_db,
                        weekly_target_completed_db: doc.weekly_target_completed_db,

                        weekly_no_of_new_calls_assigned_db: doc.weekly_no_of_new_calls_assigned_db,
                        weekly_no_of_new_calls_completed_db: doc.weekly_no_of_new_calls_completed_db,

                    }
                },
                { upsert: true, new: true }
            )
        }

        console.log("✅ Cron Job User Weekly Updated")
    } catch (err) {
        console.log("internal error in weekly progress", err)
    }
})

// CRON JOB USER FOR MONTHLY REPORT
cron.schedule("* * * * *", async () => {
    try {
        const tz = "Asia/Kolkata"
        const startOfMonth = moment.tz(tz).startOf("month").toDate();
        const endOfMonth = moment.tz(tz).endOf("month").toDate();

        const doc = await userDailyProgress.aggregate([
            { $match: { createdAt: { $gt: startOfMonth, $lte: endOfMonth } } },
            {
                $group: {
                    _id: "$userId_db",
                    monthly_installation_assigned_db: { $sum: "$daily_installation_assigned_db" },
                    monthly_installation_completed_db: { $sum: "$daily_installation_completed_db" },

                    monthly_demo_assigned_db: { $sum: "$daily_demo_assigned_db" },
                    monthly_demo_completed_db: { $sum: "$daily_demo_completed_db" },

                    monthly_recovery_assigned_db: { $sum: "$daily_recovery_assigned_db" },
                    monthly_recovery_completed_db: { $sum: "$daily_recovery_completed_db" },

                    monthly_support_assigned_db: { $sum: "$daily_support_assigned_db" },
                    monthly_support_completed_db: { $sum: "$daily_support_completed_db" },

                    monthly_target_assigned_db: { $sum: "$daily_target_assigned_db" },
                    monthly_target_completed_db: { $sum: "$daily_target_completed_db" },

                    monthly_no_of_new_calls_assigned_db: { $sum: "$daily_no_of_new_calls_assigned_db" },
                    monthly_no_of_new_calls_completed_db: { $sum: "$daily_no_of_new_calls_completed_db" },

                }
            }
        ])

        for (const monthlylDoc of doc) {
            await userMonthlyProgress.findOneAndUpdate(
                { userId_db: monthlylDoc._id },
                {
                    $set: {

                        monthly_installation_assigned_db: monthlylDoc.monthly_installation_assigned_db,
                        monthly_installation_completed_db: monthlylDoc.monthly_installation_completed_db,

                        monthly_demo_assigned_db: monthlylDoc.monthly_demo_assigned_db,
                        monthly_demo_completed_db: monthlylDoc.monthly_demo_completed_db,

                        monthly_recovery_assigned_db: monthlylDoc.monthly_recovery_assigned_db,
                        monthly_recovery_completed_db: monthlylDoc.monthly_recovery_completed_db,

                        monthly_support_assigned_db: monthlylDoc.monthly_support_assigned_db,
                        monthly_support_completed_db: monthlylDoc.monthly_support_completed_db,

                        monthly_target_assigned_db: monthlylDoc.monthly_target_assigned_db,
                        monthly_target_completed_db: monthlylDoc.monthly_target_completed_db,

                        monthly_no_of_new_calls_assigned_db: monthlylDoc.monthly_no_of_new_calls_assigned_db,
                        monthly_no_of_new_calls_completed_db: monthlylDoc.monthly_no_of_new_calls_completed_db,

                    }
                },
                { upsert: true, new: true },
            )
        }

        console.log("✅ Cron Job User Montly Updated")
    } catch (err) {
        console.log("internal error in monthly progress", err)
    }
})

// CRON JOB USER GRAPH
cron.schedule("* * * * *", async () => {
    try {
        const result = await userDailyProgress.find().sort({ date_db: 1 })
        // console.log("result", result)
        const month = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]
        const users = {}
        for (const item of result) {
            const userId = item.userId_db;
            const idealValue = item.daily_demo_assigned_db +
                item.daily_installation_assigned_db +
                item.daily_no_of_new_calls_assigned_db +
                item.daily_recovery_assigned_db +
                item.daily_support_assigned_db +
                item.daily_target_assigned_db

            const actualValue = item.daily_demo_completed_db +
                item.daily_installation_completed_db +
                item.daily_no_of_new_calls_completed_db +
                item.daily_recovery_completed_db +
                item.daily_support_completed_db +
                item.daily_target_completed_db



            const ideal = idealValue
            const actual = actualValue

            if (!users[userId]) {
                users[userId] = {
                    idealTotal: 0,
                    actualTotal: 0,
                    idealArray: [0],
                    actualArray: [0],
                }
            }

            // users[userId].idealTotal += ideal;
            // users[userId].actualTotal += actual;
            users[userId].idealTotal = ideal;
            users[userId].actualTotal = actual;

            users[userId].idealArray.push(users[userId].idealTotal)
            users[userId].actualArray.push(users[userId].actualTotal);

            for (let userId in users) {
                // console.log(`User: ${userId}`);
                // console.log("Ideal Graph:", users[userId].idealArray);
                // console.log("Actual Graph:", users[userId].actualArray);
                const idealArr = users[userId].idealArray;
                const now = new Date()
                const monIdx = now.getMonth()
                const dateArray = idealArr.map((_, index) => {
                    const day = index + 1;
                    return `${day} ${month[monIdx]}`
                })
                await userGraphModel.findOneAndUpdate(
                    {
                        userId_db: userId,
                    },
                    {
                        date_db: dateArray,
                        ideal_db: users[userId].idealArray,
                        actual_db: users[userId].actualArray
                    },
                    { upsert: true, new: true }
                )
            }



        }
        console.log("✅ Cron Job User Graph Updated")
    } catch (err) {
        console.log("internal error in graph progress", err)
    }
})


module.exports = { createUserProgress, getUserDailyReport, getUserGraphReport }