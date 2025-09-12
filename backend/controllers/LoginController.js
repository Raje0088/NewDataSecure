const { Secure_User_Data_Model } = require("../models/user")
const { loginRecordModel } = require("../models/LoginRecordModel")
const bcrypt = require('bcryptjs');
const requestIp = require('request-ip')
const geoip = require('geoip-lite');

// const userLogin = async (req, res) => {
//     try {
//         const { userId, password } = req.body;
//         const result = await Secure_User_Data_Model.findOne({ userID: userId })
//         if (!result) return res.status(500).json({ message: "User Id not Found" })

//         const ipResponse = await fetch("https://api.ipify.org?format=json");
//         const { ip } = await ipResponse.json();

//         console.log("Public IP:", ip);
//         const response = await fetch(`http://ip-api.com/json/${ip}`);
//         const data = await response.json()

//         // console.log("data", data)

//         const record = await loginRecordModel.create({
//             userId_db: userId,
//             loginTime_db: new Date().toLocaleTimeString("en-GB"),
//             date_db: new Date().toLocaleDateString("en-GB"),
//             location_db:data.city,
//             ip_db:ip,
//             lat_db:data.lat,
//             lon_db:data.lon,
//         })

//         console.log("login records", record)

//         const matchPassword = await bcrypt.compare(password, result.password);
//         if (matchPassword) {
//             return res.status(200).json({ message: "Password Match", userLoginId: userId })
//         } else {
//             return res.status(500).json({ message: "Password not Match" })
//         }

//     } catch (err) {
//         console.log("internal error", err)
//     }
// }

const userLogin = async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0]
        const { userId, password } = req.body;
        const result = await Secure_User_Data_Model.findOne({ userID: userId });
        if (!result) return res.status(500).json({ message: "User Id not Found" });

        // Get LAN/internal IP of the client
        let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Remove IPv6 prefix if present (::ffff:)
        if (ip.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];

        // Lookup location using geoip-lite
        const geo = geoip.lookup(ip) || { city: "Local Network", ll: [0, 0] };
        const data = { city: geo.city, lat: geo.ll[0], lon: geo.ll[1] };
        // Record login
        const record = await loginRecordModel.create({
            userId_db: userId,
            loginTime_db: new Date().toLocaleTimeString("en-GB"),
            date_db: date,
            location_db: data.city,
            ip_db: ip,
            lat_db: data.lat,
            lon_db: data.lon,
            start_db: new Date().getTime(),
            session_db: true
        });

        console.log("login records", record);

        // Check password
        const matchPassword = await bcrypt.compare(password, result.password);
        if (matchPassword) {
            return res.status(200).json({ message: "Password Match", userLoginId: userId });
        } else {
            return res.status(500).json({ message: "Password not Match" });
        }

    } catch (err) {
        console.log("internal error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const userLogout = async (req, res) => {
    try {
        const { userId } = req.body;
        const date = new Date().toISOString().split("T")[0]
        const time = new Date().toLocaleTimeString("en-GB");
        console.log("userid",userId)
        const existingLogin = await loginRecordModel.findOne({ userId_db: userId, date_db: date, session_db: true })
        if(!existingLogin) return res.status(400).json({message: `Login session not available for ${userId}`})
      
        const end = new Date().getTime()
        const totalSecond = Math.floor((end - existingLogin?.start_db) / 1000);
        const hr = Math.floor(totalSecond / 3600)
        const min = Math.floor((totalSecond % 3600) / 60)
        const sec = Math.floor(totalSecond % 60)

        const totalDuration = `${hr}hr ${min}min ${sec}sec`
        const result = await loginRecordModel.findOneAndUpdate(
            { userId_db: userId, date_db: date, session_db: true },
            {
                $set: {
                    logoutTime_db: time,
                    totalHours_db: totalDuration,
                    session_db: false,
                    end_db: end,
                }
            }
        )
        res.status(200).json({ message: `${userId} Logout Successfully`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { userLogin, userLogout }