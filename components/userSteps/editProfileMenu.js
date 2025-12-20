const chunkArray = require("../../utils/chunkArray.js");

const editProfileMenu = async (
  ctx,
  telegramId,
  existingUser,
  usersMap,
  forYouList,
  forYouTime,
  suggestQueue,
  languageText,
  ages,
  langsTextShow,
) => {
  if (ctx?.message?.text === "1🚀") {
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
        forYouTime.get(telegramId) + 600000 > Date.now()
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
            is_persistent: true,
          },
        });

        const {
          fullName,
          age,
          state,
          flag,
          bio,
          profileImages,
          inviteCode: inviteCode_from_forYouList,
        } = forYouList.get(telegramId)[0];

        const photos = profileImages;
        existingUser.lastViewed =
          +forYouList.get(telegramId)[0].telegramId;

        usersMap.set(telegramId, {
          time: Date.now(),
          user: existingUser,
        });
        // const photos = existingUser.profileImages | [];
        await ctx.replyWithMediaGroup(
          photos.map((photo, index) => ({
            type: "photo",
            media: photo,
            caption:
              index === 0
                ? `${fullName}, ${age}, ${flag + " " + state} ${
                    bio ? "\n" + bio : ""
                  } \n/user_${
                    inviteCode_from_forYouList || "not_found"
                  }`
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
            one_time_keyboard: false,
            is_persistent: true,
          },
        });

        // setTimeout(async () => {
        try {
          const {
            fullName,
            age,
            state,
            flag,
            bio,
            profileImages,
            inviteCode: inviteCode_from_forYouList,
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
                    }\n/user_${
                      inviteCode_from_forYouList || "not_found"
                    }`
                  : undefined,
            })),
          );
          existingUser.lastViewed =
            +forYouList.get(telegramId)[0].telegramId; // نیاز به ذخیره کردنش نیست
          usersMap.set(telegramId, {
            time: Date.now(),
            user: existingUser,
          });
        } catch (error) {
          console.log({ error });
        }
        // }, 3000);
      }
    } catch (error) {
      console.log({ error });
    }
  } else if (ctx?.message?.text === "2") {
    existingUser.editProfileStep = "age";
    existingUser.userStep = "editProfile";
    // await existingUser.save();

    usersMap.set(telegramId, {
      time: Date.now(),
      user: existingUser,
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
      try {
        ctx.reply(languageText.somethingWentWrong + "r8");
      } catch (error) {
        console.log({ error });
      }
    }
  } else if (ctx?.message?.text === "3") {
    existingUser.userStep = "changePhoto";
    // await existingUser.save();

    usersMap.set(telegramId, {
      time: Date.now(),
      user: existingUser,
    });

    try {
      ctx.reply(languageText.sendPhoto, {
        reply_markup: {
          keyboard: [
            [
              {
                text: languageText.goBack,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: false,
          is_persistent: true,
        },
      });
    } catch (error) {
      try {
        ctx.reply(languageText.somethingWentWrong + "r27");
      } catch (error) {
        console.log({ error });
      }
    }
  } else if (ctx?.message?.text === "4") {
    try {
      existingUser.userStep = "changeLanguage";
      // await existingUser.save();
      usersMap.set(telegramId, {
        time: Date.now(),
        user: existingUser,
      });

      ctx.reply(languageText.selectLanguage, {
        reply_markup: {
          keyboard: chunkArray(langsTextShow, 2),
          resize_keyboard: true,
          one_time_keyboard: false,
          is_persistent: true,
        },
      });
    } catch (error) {
      try {
        ctx.reply(languageText.somethingWentWrong + "r2");
      } catch (error) {
        console.log({ error });
      }
    }
  } else {
    try {
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
            is_persistent: true,
          },
        },
      );
    } catch (error) {
      console.log({ error });
    }
  }
};

module.exports = editProfileMenu;
