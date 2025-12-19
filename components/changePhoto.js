const { default: axios } = require("axios");
const User = require("../models/User");
const { uploadImageFromUrl } = require("./uploadImageFromUrl");
const usersMap = require("../utils/usersMap");
const Pictures = require("../models/Pictures");

const changePhoto = async (
  ctx,
  languageText,
  telegramId,
  existingUser,
  redisClient,
  forYouList,
  forYouTime,
  suggestQueue,
) => {
  if (existingUser.changePhotoStep === "isCorrectProfile") {
    if (ctx?.message?.text === languageText.yes) {
      try {
        // save in redis
        // save in redis
        await redisClient.hmset(`user:${existingUser.telegramId}`, {
          profileImages: JSON.stringify(
            existingUser.profileImages ||
              existingUser.profileImagesEdit ||
              [],
          ),
        });
        // search

        existingUser.userStep = "search";
        existingUser.profileImagesEdit = [];
        existingUser.changePhotoStep = "";
        // await existingUser.save();
        usersMap.set(telegramId, {
          time: Date.now(),
          user: existingUser,
        });

        try {
          existingUser.userStep = "search";
          usersMap.set(telegramId, {
            time: Date.now(),
            user: existingUser,
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

                is_persistent: true, // این خط را اضافه کنید
              },
            });

            const { fullName, age, state, flag, bio, profileImages } =
              forYouList.get(telegramId)[0];

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
              user: existingUser,
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
    } else if (ctx?.message?.text === languageText.editMyProfile) {
      try {
        await User.updateOne(
          { telegramId },
          { userStep: "editProfileMenu" },
        );

        existingUser.registerStep = "editProfileMenu";
        existingUser.changePhotoStep = "";
        // await existingUser.save();
        usersMap.set(telegramId, {
          time: Date.now(),
          user: existingUser,
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
            },
          },
        );
      } catch (error) {
        console.log({ error });
      }
    } else {
      const photos = existingUser.profileImages || [];
      const fullName = existingUser.fullName;
      const age = existingUser.age;
      const state = existingUser.state;
      const flag = existingUser.flag;
      const bio = existingUser.moreInformation.bio;

      console.log({ photos });
      console.log({ photos2: existingUser.profileImagesEdit });

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
          },
        });
      } catch (error) {
        ctx.reply(languageText.somethingWentWrong + "r35");
        console.log({ error });
      }

      return;
    }
  } else if (ctx?.message?.text === languageText.goBack) {
    try {
      existingUser.userStep = "editProfileMenu";
      existingUser.profileImagesEdit = [];
      existingUser.changePhotoStep = "";
      // await existingUser.save();
      usersMap.set(telegramId, {
        time: Date.now(),
        user: existingUser,
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
          },
        },
      );
    } catch (error) {
      console.log({ error });
    }
  } else if (ctx.message.photo) {
    try {
      const photos = existingUser.profileImagesEdit || [];
      if (photos.length === 3) return;
      ctx.reply("⌛️");

      const fileId = ctx.message.photo.at(-1).file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);

      // let porn;

      // try {
      //   const response = await axios.get(
      //     "https://api.sightengine.com/1.0/check.json",
      //     {
      //       params: {
      //         url: fileLink,
      //         models: "nudity-2.1",
      //         api_user: "1997973516",
      //         api_secret: "cPPUdcjv88shM4qrZFGytUE44nvZ8toX",
      //       },
      //     },
      //   );

      //   const nudity = response.data?.nudity;
      //   console.log({ nudity });
      //   porn =
      //     Number(nudity.sexual_activity) > 0.3 ||
      //     Number(nudity.sexual_display) > 0.3 ||
      //     Number(nudity.very_suggestive) > 0.6;
      // } catch (error) {
      //   console.log(error);
      // }

      // if (porn) {
      //   existingUser.step = "photo";
      //   // await existingUser.save();
      //   usersMap.set(telegramId, {
      //     time: Date.now(),
      //     user: existingUser,
      //   });
      //   ctx.reply(languageText.imageNotAllowed);
      // } else {
      const imageUrl = await uploadImageFromUrl(fileLink);
      if (photos.length === 3) return;
      photos.push(imageUrl);
      await Pictures.create({
        telegramId: +telegramId || existingUser.telegramId || 0,
        url: imageUrl,
      });
      existingUser.profileImagesEdit = photos;
      // await existingUser.save();
      usersMap.set(telegramId, {
        time: Date.now(),
        user: existingUser,
      });

      if (photos.length === 1) {
        ctx.reply(languageText.photoAdded1, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: languageText.donePhotos,
                },
              ],
            ],
            resize_keyboard: true,
          },
        });
      } else if (photos.length === 2) {
        ctx.reply(languageText.photoAdded2, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: languageText.donePhotos,
                },
              ],
            ],
            resize_keyboard: true,
          },
        });
      } else {
        // setTimeout(async () => {
        try {
          if (
            existingUser.profileImages.length > 0 &&
            existingUser.profileImagesEdit > 0
          ) {
            await Pictures.deleteMany({
              url: { $in: existingUser.profileImages },
            });
          }
          existingUser.profileImages = existingUser.profileImagesEdit;
          existingUser.profileImagesEdit = [];
          existingUser.changePhotoStep = "isCorrectProfile";
          await existingUser.save();
          usersMap.set(telegramId, {
            time: Date.now(),
            user: existingUser,
          });
          const photos = existingUser.profileImages || [];
          const fullName = existingUser.fullName;
          const age = existingUser.age;
          const state = existingUser.state;
          const flag = existingUser.flag;
          const bio = existingUser.moreInformation.bio;

          console.log({ photos });

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
            },
          });
        } catch (error) {
          console.log({ error });
          ctx.reply(languageText.somethingWentWrong + "cf32");
        }
        // }, 1000);

        return;
      }

      return;
      // }
    } catch (error) {
      ctx.reply(languageText.somethingWentWrong + "r30");
      console.log({ error });
    }
  } else if (ctx?.message?.text === languageText.donePhotos) {
    console.log("changePhoto - 4");
    ctx.reply("⌛️");

    try {
      if (
        existingUser.profileImages.length &&
        existingUser.profileImagesEdit > 0
      ) {
        await Pictures.deleteMany({
          url: { $in: existingUser.profileImages },
        });
      }
      existingUser.profileImages = existingUser.profileImagesEdit;
      existingUser.profileImagesEdit = [];
      existingUser.changePhotoStep = "isCorrectProfile";
      // await existingUser.save();
      usersMap.set(telegramId, {
        time: Date.now(),
        user: existingUser,
      });

      const photos = existingUser.profileImages || [];
      const fullName = existingUser.fullName;
      const age = existingUser.age;
      const state = existingUser.state;
      const flag = existingUser.flag;
      const bio = existingUser.moreInformation.bio;

      console.log({ photos });

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
        },
      });
    } catch (error) {
      ctx.reply(languageText.somethingWentWrong + "r31");
    }
    return;
  } else {
    existingUser.step = "photo";
    // await existingUser.save();
    usersMap.set(telegramId, {
      time: Date.now(),
      user: existingUser,
    });
    try {
      ctx.reply(languageText.sendPhoto, {
        reply_markup: {
          keyboard: [[{ text: languageText.goBack }]],
          resize_keyboard: true,
        },
      });
    } catch (error) {
      ctx.reply(languageText.somethingWentWrong + "r32");
    }
  }
};

module.exports = {
  changePhoto,
};
