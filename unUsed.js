// app.post("/fakeUser", async (req, res) => {
//   try {
//     const userRoot = await protobuf.load(
//       "./protoBuf_files/foryou.proto",
//     );
//     const ForyouProto = userRoot.lookupType("Users");

//     const fUsers = [
//       "raha",
//       "sharare",
//       "zahra",
//       "mona",
//       "fati",
//       "aylar",
//       "aanil",
//       "atefe",
//       "mobina",
//       "maryam",
//       "ana",
//       "ata",
//       "arezo",
//       "raha",
//       "bahar",
//       "goli",
//       "mahnaz",
//       "shahrzad",
//       "azin",
//       "mahsa",
//       "sara",
//     ];

//     for (const u of fUsers) {
//       // ✅ استفاده از for...of به جای forEach
//       const adaptedUser = {
//         _id: Math.floor(Math.random() * 100000).toString(),
//         telegramId: Math.floor(Math.random() * 200000) || 123,
//         fullName: u,
//         age: 24,
//         gender: "female",
//         lookingFor: "male",
//         country: "Iran",
//         state: "Tehran",
//         flag: "🇮🇷",
//         language: "en",
//         lastSeen: 0,
//         lastUpdate: 0,
//         sleep: false,
//         education: "",
//         dietaryPreference: "",
//         job: "",
//         workout: "",
//         sleepingHabits: "",
//         pets: "",
//         bio: "",
//         profileImages: [
//           "https://pouns-storage.storage.c2.liara.space/1722347928502-c8b3c62f-3470-429f-ac34-7330520397c7.jpg",
//         ],
//         score: 90,
//       };

//       const saveToRedis = async (keyType) => {
//         let redisKey;
//         if (keyType === "city") {
//           redisKey = `city:${adaptedUser.gender.toLowerCase()}:${adaptedUser.state.toLowerCase()}`;
//         } else {
//           redisKey = `globalUsers:${adaptedUser.gender.toLowerCase()}`;
//         }

//         let usersArray = [adaptedUser];
//         const getData = await redisClient.getBuffer(redisKey);

//         if (Buffer.isBuffer(getData)) {
//           try {
//             const decodeBuffer = ForyouProto.decode(getData);
//             const filteredUsers = (decodeBuffer.users || []).filter(
//               (f) => f._id !== adaptedUser._id,
//             );
//             usersArray =
//               filteredUsers.length > 2100
//                 ? [adaptedUser, ...filteredUsers.slice(0, 1900)]
//                 : [adaptedUser, ...filteredUsers];
//           } catch (err) {
//             console.error("Error decoding buffer:", err);
//           }
//         }

//         const errMsg = ForyouProto.verify({ users: usersArray });
//         if (errMsg) {
//           console.error("Protobuf validation error:", errMsg);
//           return;
//         }

//         const message_ = ForyouProto.create({ users: usersArray });
//         const buffer = ForyouProto.encode(message_).finish();
//         await redisClient.set(redisKey, buffer);

//         console.log("✅ Saved in Redis:", redisKey);
//       };

//       await saveToRedis("city");
//       await saveToRedis("global");
//     }

//     // ✅ فقط یک بار، بعد از اتمام حلقه پاسخ بده
//     res
//       .status(200)
//       .send("✅ Fake users saved to Redis successfully.");
//   } catch (err) {
//     console.error("❌ Error in /fakeUser:", err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/addFake", async (req, res) => {
//   try {
//     const promises = fakeUsers.map(async (user) => {
//       const { fullName, bio, age, profileImage, telegramId } = user;

//       // ذخیره در MongoDB
//       await User.create({
//         telegramId,
//         fullName,
//         age,
//         profileImages: [profileImage],
//         country: "Iran",
//         state: "Tehran",
//         flag: "🇮🇷",
//         gender: "female",
//         lookingFor: "male",
//       });

//       // ذخیره در Redis
//       await redisClient.hset(`user:${telegramId}`, {
//         lastUpdate: Date.now().toString(),
//         lastSeen: Date.now().toString(),
//         createAt: Date.now().toString(),
//         language: "fa",
//         age: age.toString(),
//         gender: "female",
//         lookingFor: "male",
//         country: "Iran",
//         flag: "🇮🇷",
//         state: "Tehran",
//         fullName,
//         bio,
//         profileImages: JSON.stringify([profileImage]),
//         sleep: "false",
//       });

//       // اضافه به صف
//       await foryouQueue.add({ telegramId });
//     });

//     await Promise.all(promises);

//     res.status(200).send("✅ Fake users added successfully.");
//   } catch (err) {
//     console.error("Error adding fake users:", err);
//     res.status(500).send("❌ Error adding fake users.");
//   }
// });

const break_________________________________________ = 0;

// async function cleanupOldUsers() {
//   try {
//     const now = getNowTime();
//     const thirtyMinutesInMs = 1800000; // 30 دقیقه به میلی‌ثانیه
//     // const thirtyMinutesInMs = 30 * 60 * 1000; // 30 دقیقه به میلی‌ثانیه

//     const entries = Array.from(usersMap.entries());

//     await Promise.all(
//       entries.map(async ([telegramId, userData]) => {
//         const timeDifference = now - userData.time;

//         if (timeDifference >= thirtyMinutesInMs) {
//           const currentUser = userData.user;

//           // ذخیره‌ی اطلاعات کاربر در دیتابیس
//           await User.findOneAndUpdate(
//             { telegramId },
//             {
//               sendFakeLike: currentUser.userName || 0,
//               userName: currentUser.userName || "",
//               userStep: currentUser.userStep || "menu",
//               registerStep: currentUser.registerStep || "language",
//               editProfileStep: currentUser.editProfileStep || "age",
//               changePhotoStep: currentUser.changePhotoStep || "",
//               firstLikeTime:
//                 currentUser.firstLikeTime || 1734878731629,

//               lastAnsweredMessage:
//                 currentUser.lastAnsweredMessage || 0,
//               lastViewed: currentUser.lastViewed || 0,

//               ban: currentUser.ban || false,

//               firstLike: currentUser.firstLike || 0,
//               firstNope: currentUser.firstNope || 0,
//               giftLikeCount: currentUser.giftLikeCount || 0,
//               unavailablePv: currentUser.unavailablePv || false,

//               likeCount: currentUser.likeCount || 1,
//               sleep: currentUser.sleep ?? false,
//               fullName: currentUser.fullName || "",
//               age: currentUser.age != null ? +currentUser.age : 18,
//               gender: currentUser.gender || "",
//               lookingFor: currentUser.lookingFor || "",
//               state: currentUser.state || "",
//               country: currentUser.country || "",
//               flag: currentUser.flag || "",
//               language: currentUser.language || "en",
//               profileImages: currentUser.profileImages || [],
//               profileImagesEdit: currentUser.profileImagesEdit || [],
//               "moreInformation.bio": currentUser.bio || "",
//               matches: currentUser.matches || [],
//               userProfile: currentUser.userProfile || {},
//               inviteCode: currentUser.inviteCode || "",
//             },
//           );

//           // حذف کاربر از Map
//           usersMap.delete(telegramId);
//         }
//       }),
//     );

//     // console.log(
//     //   `🧹 پاک‌سازی انجام شد. تعداد کاربران باقیمانده: ${usersMap.size}`,
//     // );
//   } catch (error) {
//     console.error("❌ خطا در پاک‌سازی کاربران:", error);
//   }
// }
