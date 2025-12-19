// redisService.js
const Redis = require("ioredis");
const redisClient = new Redis();
const { promisify } = require("util");

const hashTable = new Map();

async function loadAllKeysAndValues() {
  let cursor = "0";

  do {
    const result = await redisClient.scan(
      cursor,
      "MATCH",
      "*",
      "COUNT",
      1000,
    );

    cursor = result[0];
    const keys = result[1];

    for (const key of keys) {
      const values = await redisClient.hgetall(key);
      let val;
      if (typeof values == "string") {
        val = JSON.parse(values);
      } else {
        val = values;
      }
      hashTable.set(key, values);
    }
  } while (cursor !== "0");
}

async function refreshHashTable() {
  try {
    await loadAllKeysAndValues();
    console.log("HashTable refreshed at", new Date());
  } catch (err) {
    console.error("Error refreshing hashTable:", err);
  }
}

// اجرای تابع برای بارگذاری همه key ها و values
loadAllKeysAndValues()
  .then(() => {
    console.log("All keys and values loaded into hashTable.");
  })
  .catch((err) => {
    console.error("Error retrieving keys and values:", err);
  });

// زمانی که ساعت 7 صبح باشد
const scheduleHour = 7;
const scheduleMinute = 0;
const scheduleSecond = 0;

async function scheduleRefresh() {
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    scheduleHour,
    scheduleMinute,
    scheduleSecond,
  );

  if (now >= scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1); // Next day
  }

  const delay = scheduledTime.getTime() - now.getTime();
  console.log(`Next refresh scheduled at: ${scheduledTime}`);

  setTimeout(async () => {
    await refreshHashTable();
    setInterval(refreshHashTable, 24 * 60 * 60 * 1000); // Repeat every 24 hours
  }, delay);
}

scheduleRefresh().catch((err) => {
  console.error("Error scheduling refresh:", err);
});

module.exports = {
  hashTable,
};
