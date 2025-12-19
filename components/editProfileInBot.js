const axios = require("axios");
const User = require("../models/User");
const countries = require("../data/countries.json");
const { getUserProfilePicture } = require("./getProfilePicture");
const { uploadImageFromUrl } = require("./uploadImageFromUrl");
const badWords = require("../data/words");
const protobuf = require("protobufjs");
const usersMap = require("../utils/usersMap");

const editProfileInBot = async (
  ctx,
  chunkArray,
  languageText,
  ages,
  countriesTextShow,
  telegramId,
  savedUser,
  redisClient,
  forYouList,
  forYouTime,
  suggestQueue,
  foryouQueue,
) => {
  const step = savedUser.editProfileStep;

  if (step === "age") {
    if (
      !ctx?.message?.text ||
      !Number(ctx?.message?.text) ||
      !ages.includes(Number(ctx?.message?.text))
    ) {
      savedUser.editProfileStep = "age";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "age" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });
      try {
        ctx.reply(languageText.errorSelectAge, {
          reply_markup: {
            keyboard: [...chunkArray(ages, 4)],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r8");
      }
    } else {
      savedUser.editProfileStep = "gender";
      savedUser.age = Number(ctx?.message?.text) || 1;
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "gender", age: savedUser.age },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });
      // ctx.replyWithInvoice({
      //   title: "اشتراک ماهانه",
      //   description:
      //     "با خرید اشتراک به امکانات ویژه دسترسی خواهید داشت.",
      //   payload: "premium_subscription_monthly",
      //   provider_token: "STARS",
      //   currency: "XTR",
      //   prices: [
      //     {
      //       label: "اشتراک 1 ماهه",
      //       amount: 1, // معادل 10 ستاره (1 ستاره = 10)
      //     },
      //   ],
      //   is_flexible: false,
      //   start_parameter: "subscribe-now",
      //   reply_markup: {
      //     inline_keyboard: [
      //       [
      //         {
      //           text: "پرداخت با ستاره‌ها",
      //           pay: true,
      //         },
      //       ],
      //     ],
      //   },
      // });

      try {
        ctx.reply(languageText.selectGender, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: languageText.female,
                },
                {
                  text: languageText.male,
                },
              ],
              [
                {
                  text: languageText.previousStep,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r9");
      }
    }
  }
  if (step === "gender") {
    if (
      ctx?.message?.text === languageText.female ||
      ctx?.message?.text === languageText.male
    ) {
      savedUser.editProfileStep = "lookingFor";
      savedUser.gender =
        ctx?.message?.text === languageText?.female
          ? "female"
          : "male";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "lookingFor", gender: savedUser.gender },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.lookingFor, {
          reply_markup: {
            keyboard: [
              [
                { text: languageText.women },
                { text: languageText.men },
                { text: languageText.noMatther },
              ],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r10");
      }
    } else if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "age";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "age" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.selectAge, {
          reply_markup: {
            keyboard: [...chunkArray(ages, 4)],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r11");
      }
    } else {
      try {
        ctx.reply(languageText.errorSelectGender, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: languageText.female,
                },
                {
                  text: languageText.male,
                },
              ],
              [
                {
                  text: languageText.previousStep,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r12");
      }
    }
  }
  if (step === "lookingFor") {
    if (
      ctx?.message?.text === languageText.women ||
      ctx?.message?.text === languageText.men ||
      ctx?.message?.text === languageText.noMatther
    ) {
      savedUser.editProfileStep = "country";
      savedUser.lookingFor =
        ctx?.message?.text === languageText.women
          ? "female"
          : ctx?.message?.text === languageText.men
          ? "male"
          : "noMatter";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        {
          editProfileStep: "country",
          lookingFor: savedUser.lookingFor,
        },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.chooseCountry, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(countriesTextShow, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r13");
      }
    } else if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "gender";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "gender" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.selectGender, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: languageText.female,
                },
                {
                  text: languageText.male,
                },
              ],
              [
                {
                  text: languageText.previousStep,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r14");
      }
    } else {
      try {
        ctx.reply(languageText.lookingFor, {
          reply_markup: {
            keyboard: [
              [
                { text: languageText.women },
                { text: languageText.men },
                { text: languageText.noMatther },
              ],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r15");
      }
    }
  }
  if (step === "country") {
    if (countriesTextShow.map(String).includes(ctx?.message?.text)) {
      try {
        savedUser.editProfileStep = "state";
        savedUser.country = countries.find(
          (c) =>
            c.emojiFlag + " " + c.nativeName === ctx?.message?.text,
        ).country;
        savedUser.flag = countries.find(
          (c) =>
            c.emojiFlag + " " + c.nativeName === ctx?.message?.text,
        ).emojiFlag;
        // await savedUser.save();

        await User.findOneAndUpdate(
          { telegramId },
          {
            editProfileStep: "state",
            country: savedUser.country,
            flag: savedUser.flag,
          },
        );

        usersMap.set(telegramId, {
          time: Date.now(),
          user: savedUser,
        });

        const states = countries.find(
          (c) =>
            c.emojiFlag + " " + c.nativeName === ctx?.message?.text,
        ).subdivisions;
        const showStates = states.map((item) => item.local);
        ctx.reply(languageText.chooseOne, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(showStates, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r16");
      }
    } else if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "lookingFor";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "lookingFor" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });
      try {
        ctx.reply(languageText.lookingFor, {
          reply_markup: {
            keyboard: [
              [
                { text: languageText.women },
                { text: languageText.men },
                { text: languageText.noMatther },
              ],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r17");
      }
    } else {
      try {
        ctx.reply(languageText.chooseCountry, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(countriesTextShow, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r18");
      }
    }
  }
  if (step === "state") {
    const findState = countries
      .find((c) => c.country === savedUser.country)
      ?.subdivisions.find((s) => s.local === ctx?.message?.text);

    if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "country";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "country" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.chooseCountry, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(countriesTextShow, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r19");
      }
    } else if (findState) {
      savedUser.editProfileStep = "name";
      savedUser.state = findState?.english || "";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "name", state: savedUser.state },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.enterName, {
          reply_markup: {
            keyboard: [
              [{ text: savedUser.fullName }],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r20");
        console.log({ error });
      }
    } else {
      try {
        const states = countries.find(
          (c) => c.country === savedUser.country,
        ).subdivisions;
        const showStates = states.map((item) => item.local);
        ctx.reply(languageText.chooseOne, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(showStates, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r21");
      }
    }
  }
  if (step === "name") {
    if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "state";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "state" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        const states = countries.find(
          (c) => c.country === savedUser.country,
        ).subdivisions;
        const showStates = states.map((item) => item.local);
        ctx.reply(languageText.chooseOne, {
          reply_markup: {
            keyboard: [
              [{ text: languageText.previousStep }],
              ...chunkArray(showStates, 3),
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r22");
      }
    } else if (!ctx?.message?.text) {
      savedUser.editProfileStep = "name";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "name" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.enterName, {
          reply_markup: {
            keyboard: [
              [{ text: telegramName }],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r23");
      }
    } else {
      const isBadWord = badWords.some((word) =>
        ctx?.message?.text
          ?.toLowerCase()
          .includes(word.toLowerCase()),
      );
      if (isBadWord) {
        ctx.reply(languageText.incluseBadWord);
        return;
      }
      // save name
      savedUser.editProfileStep = "bio";
      savedUser.fullName = ctx?.message?.text;
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "bio", fullName: savedUser.fullName },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.bio, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: savedUser?.moreInformation?.bio
                    ? savedUser?.moreInformation?.bio
                    : languageText.skip,
                },
              ],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r24");
      }
    }
  }
  if (step === "bio") {
    if (ctx?.message?.text === languageText.previousStep) {
      savedUser.editProfileStep = "name";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { editProfileStep: "name" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        ctx.reply(languageText.enterName, {
          reply_markup: {
            keyboard: [
              [{ text: savedUser.fullName || "-" }],
              [{ text: languageText.previousStep }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r25");
      }
    } else if (!ctx?.message?.text || ctx?.message?.text.length < 5) {
      try {
        ctx.reply(languageText.bioError, {
          reply_markup: {
            keyboard: [[{ text: languageText.previousStep }]],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r26");
      }
    } else {
      const isBadWord = badWords.some((word) =>
        ctx?.message?.text
          ?.toLowerCase()
          .includes(word.toLowerCase()),
      );
      if (isBadWord) {
        ctx.reply(languageText.incluseBadWord);
        return;
      }
      // save bio

      ctx.reply("⌛️");

      savedUser.moreInformation.bio =
        ctx?.message?.text !== languageText.skip
          ? ctx?.message?.text
          : "";
      savedUser.editProfileStep = "isCorrectProfile";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        {
          editProfileStep: "isCorrectProfile",
          "moreInformation.bio": savedUser.moreInformation.bio,
        },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      try {
        const photos = savedUser.profileImages;
        const fullName = savedUser.fullName;
        const age = savedUser.age;
        const state = savedUser.state;
        const flag = savedUser.flag;
        const bio = savedUser.moreInformation.bio;

        await ctx.replyWithMediaGroup(
          photos.map((photo, index) => ({
            type: "photo",
            media: photo,
            caption:
              index === 0
                ? `${fullName}, ${age}, ${flag + " " + state} ${
                    bio ? "\n" + bio : ""
                  } `
                : undefined,
          })),
        );
        ctx.reply(languageText.correct, {
          reply_markup: {
            keyboard: [
              [
                { text: languageText.yes },
                { text: languageText.editMyProfile },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r31");
      }
    }
  }
  if (step === "isCorrectProfile") {
    if (ctx?.message?.text === languageText.yes) {
      const language = savedUser.language;
      const age = savedUser.age;
      const gender = savedUser.gender;
      const lookingFor = savedUser.lookingFor;
      const country = savedUser.country;
      const state = savedUser.state;
      const name = savedUser.fullName;
      const bio = savedUser.moreInformation.bio;
      const profileImages = savedUser.profileImages;
      const flag = savedUser.flag;

      foryouQueue.add({ telegramId });

      if (
        !Array.isArray(forYouList.get(telegramId)) ||
        forYouList.get(telegramId).length < 10
      ) {
        const getData = await redisClient.getBuffer(
          `city:${lookingFor.toLowerCase()}:${state.toLowerCase()}`,
        );

        if (Buffer.isBuffer(getData)) {
          const userRoot = await protobuf.load(
            "./protoBuf_files/foryou.proto",
          );

          let ForyouProto = userRoot.lookupType("Users");
          const decodedMessage = ForyouProto.decode(getData);
          let usersArrayFromRedis = decodedMessage.users || [];
          console.log({ usersArrayFromRedis });
          if (usersArrayFromRedis.length < 100) {
            const getDataGlobal = await redisClient.getBuffer(
              `globalUsers:${lookingFor.toLowerCase()}`,
            );
            if (Buffer.isBuffer(getDataGlobal)) {
              const decodedMessage2 = ForyouProto.decode(getData);
              const result = Array.from(
                new Map(
                  [
                    ...usersArrayFromRedis,
                    ...decodedMessage2.users,
                  ].map((item) => [item.telegramId, item]),
                ).values(),
              );
              usersArrayFromRedis = result || [];
            }
          } else {
          }
          forYouList.set(telegramId, usersArrayFromRedis);
          console.log({ usersArrayFromRedis });
        }
      }

      if (
        language &&
        age &&
        gender &&
        lookingFor &&
        state &&
        country &&
        name
      ) {
        try {
          // save in redis
          // save in redis
          await redisClient.hmset(`user:${savedUser.telegramId}`, {
            lastUpdate: Date.now(),
            lastSeen: Date.now(),
            language,
            age: age.toString(),
            gender,
            lookingFor,
            country,
            flag,
            state,
            fullName: name,
            bio,
          });

          savedUser.userStep = "search";
          // await savedUser.save();

          await User.findOneAndUpdate(
            { telegramId },
            { userStep: "search" },
          );

          usersMap.set(telegramId, {
            time: Date.now(),
            user: savedUser,
          });

          try {
            savedUser.userStep = "search";
            usersMap.set(telegramId, {
              time: Date.now(),
              user: savedUser,
            });
            if (
              forYouList.get(telegramId) &&
              Array.isArray(forYouList.get(telegramId)) &&
              forYouList.get(telegramId).length > 10 &&
              forYouTime.get(telegramId) &&
              forYouTime.get(telegramId) + 300000 > Date.now()
            ) {
              await ctx.reply("🔎", {
                reply_markup: {
                  keyboard: [
                    [
                      { text: "💌" },
                      { text: "❌" },
                      { text: "❤️" },
                      { text: "☰" },
                    ],
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: false,
                  is_persistent: true, // این خط را اضافه کنید
                },
              });

              const {
                fullName,
                age,
                state,
                flag,
                bio,
                profileImages,
              } = forYouList.get(telegramId)[0];

              const photos = profileImages;
              // const photos = existingUser.profileImages || [];
              await ctx.replyWithMediaGroup(
                photos.map((photo, index) => ({
                  type: "photo",
                  media: photo,
                  caption:
                    index === 0
                      ? `${fullName}, ${age}, ${flag + " " + state} ${
                          bio ? "\n" + bio : ""
                        } `
                      : undefined,
                })),
              );
            } else {
              forYouTime.set(telegramId, Date.now());
              // add to search queue
              suggestQueue.add({
                telegramId,
                user: savedUser,
              });

              await ctx.reply("🔎", {
                reply_markup: {
                  keyboard: [
                    [
                      { text: "💌" },
                      { text: "❌" },
                      { text: "❤️" },
                      { text: "☰" },
                    ],
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: false,
                  is_persistent: true,
                },
              });

              setTimeout(async () => {
                try {
                  const {
                    fullName,
                    age,
                    state,
                    flag,
                    bio,
                    profileImages,
                  } = forYouList.get(telegramId)[0];

                  const photos = profileImages;
                  // const photos = existingUser.profileImages || [];
                  await ctx.replyWithMediaGroup(
                    photos.map((photo, index) => ({
                      type: "photo",
                      media: photo,
                      caption:
                        index === 0
                          ? `${fullName}, ${age}, ${
                              flag + " " + state
                            } ${bio ? "\n" + bio : ""} `
                          : undefined,
                    })),
                  );
                } catch (error) {
                  console.log({ error });
                }
              }, 3000);
            }
          } catch (error) {
            console.log({ error });
          }

          // ctx.reply("🔍", {
          //   reply_markup: {
          //     keyboard: [
          //       [
          //         { text: "💌" },
          //         { text: "❌" },
          //         { text: "❤️" },
          //         { text: "☰" },
          //       ],
          //     ],
          //     resize_keyboard: true,
          //   },
          // });

          // ctx.replyWithPhoto(
          //   "https://pouns-storage.storage.c2.liara.space/1758644004701-4a0b00d2-f844-4e63-9923-2e3ba0de688c.jpg",
          //   {
          //     caption: "Abolfazl, 25, 🇮🇷 Tehran\njust a programmer",
          //   },
          // );
        } catch (error) {
          ctx.reply(languageText.somethingWentWrong + "r34");
        }
      } else {
        ctx.reply(languageText.somethingWentWrong);
      }
    } else if (ctx?.message?.text === languageText.editMyProfile) {
      await User.updateOne(
        { telegramId },
        { userStep: "editProfileMenu" },
      );

      savedUser.userStep = "editProfileMenu";
      // await savedUser.save();

      await User.findOneAndUpdate(
        { telegramId },
        { userStep: "editProfileMenu" },
      );

      usersMap.set(telegramId, {
        time: Date.now(),
        user: savedUser,
      });

      ctx.reply(
        `1. ${languageText.viewProfiles} \n2. ${languageText.editMyProfile} \n3. ${languageText.changeMyPhoto} \n4. ${languageText.changeLanguage}`,
        {
          reply_markup: {
            keyboard: [
              [
                { text: "1🚀" },
                { text: "2" },
                { text: "3" },
                { text: "4" },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        },
      );
    } else {
      const photos = savedUser.profileImages || [];
      const fullName = savedUser.fullName;
      const age = savedUser.age;
      const state = savedUser.state;
      const flag = savedUser.flag;
      const bio = savedUser.moreInformation.bio;

      try {
        await ctx.replyWithMediaGroup(
          photos.map((photo, index) => ({
            type: "photo",
            media: photo,
            caption:
              index === 0
                ? `${fullName}, ${age}, ${flag + " " + state} ${
                    bio ? "\n" + bio : ""
                  } `
                : undefined,
          })),
        );
        ctx.reply(languageText.correct, {
          reply_markup: {
            keyboard: [
              [
                { text: languageText.yes },
                { text: languageText.editMyProfile },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r35");
        console.log({ error });
      }

      return;
    }
  }
};

module.exports = editProfileInBot;
