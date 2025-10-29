function getDateAndTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000 //milliseconds
    const curTime = new Date(now.getTime() + istOffset).toISOString()
    const dateAndTime = curTime.split(".")[0]
    return dateAndTime;
}

module.exports = { getDateAndTime }