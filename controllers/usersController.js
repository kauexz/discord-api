import { client } from "../index.js";
import dayjs from "dayjs";

const nitroLevels = [
 { badge: "nitro", lowerLimit: 0, upperLimit: 0 },
 { badge: "nitro_bronze", lowerLimit: 1, upperLimit: 2 },
 { badge: "nitro_silver", lowerLimit: 3, upperLimit: 5 },
 { badge: "nitro_gold", lowerLimit: 6, upperLimit: 11 },
 { badge: "nitro_platinum", lowerLimit: 12, upperLimit: 23 },
 { badge: "nitro_diamond", lowerLimit: 24, upperLimit: 35 },
 { badge: "nitro_emerald", lowerLimit: 36, upperLimit: 59 },
 { badge: "nitro_ruby", lowerLimit: 60, upperLimit: 71 },
 { badge: "nitro_fire", lowerLimit: 72 },
];

async function getCurrentNitroBadge(months, nitroSinceDate) {
 if (!nitroSinceDate) {
  return { badge: null, currentBadgeDate: null };
 }

 const currentBadge = nitroLevels.find((badge) => {
  const inLowerLimit = months >= badge.lowerLimit;
  const inUpperLimit = typeof badge.upperLimit === "undefined" || months <= badge.upperLimit;
  return inLowerLimit && inUpperLimit;
 });
 return { badge: currentBadge?.badge || null, currentBadgeDate: nitroSinceDate };
}

async function getNextNitroBadge(months, nitroSinceDate) {
 if (!nitroSinceDate) {
  return { badge: null, nextBadgeDate: null };
 }

 for (let i = 0; i < nitroLevels.length; i++) {
  const badge = nitroLevels[i];
  if (months >= badge.lowerLimit && (typeof badge.upperLimit === "undefined" || months <= badge.upperLimit)) {
   const nextBadge = nitroLevels[i + 1];
   if (nextBadge) {
    const nextBadgeDate = nitroSinceDate.add(nextBadge.lowerLimit, "months");
    return { badge: nextBadge.badge, nextBadgeDate };
   }
   return { badge: "max_badge", nextBadgeDate: null };
  }
 }
}

async function getCurrentBoostLevel(months) {
 const boostLevels = [
  { level: "guild_booster_lvl1", lowerLimit: 0, upperLimit: 1 },
  { level: "guild_booster_lvl2", lowerLimit: 2, upperLimit: 2 },
  { level: "guild_booster_lvl3", lowerLimit: 3, upperLimit: 5 },
  { level: "guild_booster_lvl4", lowerLimit: 6, upperLimit: 8 },
  { level: "guild_booster_lvl5", lowerLimit: 9, upperLimit: 11 },
  { level: "guild_booster_lvl6", lowerLimit: 12, upperLimit: 14 },
  { level: "guild_booster_lvl7", lowerLimit: 15, upperLimit: 17 },
  { level: "guild_booster_lvl8", lowerLimit: 18, upperLimit: 23 },
  { level: "guild_booster_lvl9", lowerLimit: 24 },
 ];

 const currentLevel = boostLevels.find((level) => {
  if (level.upperLimit) {
   return months >= level.lowerLimit && months <= level.upperLimit;
  } else {
   return months >= level.lowerLimit;
  }
 })?.level;

 return currentLevel;
}

async function getNextBoostLevel(months) {
 const boostLevels = [
  { level: "guild_booster_lvl1", lowerLimit: 0, upperLimit: 1 },
  { level: "guild_booster_lvl2", lowerLimit: 2, upperLimit: 2 },
  { level: "guild_booster_lvl3", lowerLimit: 3, upperLimit: 5 },
  { level: "guild_booster_lvl4", lowerLimit: 6, upperLimit: 8 },
  { level: "guild_booster_lvl5", lowerLimit: 9, upperLimit: 11 },
  { level: "guild_booster_lvl6", lowerLimit: 12, upperLimit: 14 },
  { level: "guild_booster_lvl7", lowerLimit: 15, upperLimit: 17 },
  { level: "guild_booster_lvl8", lowerLimit: 18, upperLimit: 23 },
  { level: "guild_booster_lvl9", lowerLimit: 24 },
 ];

 for (let i = 0; i < boostLevels.length; i++) {
  const level = boostLevels[i];
  if (months >= level.lowerLimit) {
   if (typeof level.upperLimit === "undefined" || months <= level.upperLimit) {
    const nextLevel = boostLevels[i + 1];
    return nextLevel ? nextLevel.level : "max_level";
   }
  }
 }
}

async function getUserBadges(response) {
 const userBadges = response?.badges?.map((badge) => badge.id);
 return userBadges?.length > 0 ? userBadges : [];
}

async function getUserResponse(response) {
 let bannerUrl = null;
 if (response?.user_profile?.banner) {
  const extension = response.user_profile.banner.startsWith("a_") ? ".gif?size=4096" : ".png?size=4096";
  bannerUrl = `https://cdn.discordapp.com/banners/${response.user.id}/${response.user_profile.banner}${extension}`;
 }

 const monthsVerification = ["0", "2", "3", "6", "9", "12", "15", "18", "24"];
 const currentDate = dayjs();
 const nitroSinceDate = response?.premium_since ? dayjs(response.premium_since) : null;
 const premiumSinceDate = dayjs(response?.premium_guild_since);
 const monthsPassedNitro = currentDate.diff(nitroSinceDate, "month");
 const monthsPassedBoost = currentDate.diff(premiumSinceDate, "month");

 const exactMonths = monthsVerification.map((months) => {
   const targetDate = premiumSinceDate.add(months, "months");
   if (currentDate.isBefore(targetDate)) {
    return targetDate.format();
   }
  }).filter((date) => date !== null && date !== undefined);

 const currentBoostLevel = await getCurrentBoostLevel(monthsPassedBoost);
 const nextBoostLevel = await getNextBoostLevel(monthsPassedBoost);
 const nextDate = exactMonths[exactMonths.indexOf(exactMonths.find((date) => currentDate.isBefore(date)))];
 const currentNitroBadgeData = await getCurrentNitroBadge(monthsPassedNitro, nitroSinceDate);
 const nextNitroBadgeData = await getNextNitroBadge(monthsPassedNitro, nitroSinceDate);
 const badges = await getUserBadges(response);

 if (currentNitroBadgeData?.badge) {
  badges.unshift(currentNitroBadgeData.badge);
 }

 const target = await client.users.fetch(response.user.id);
 const theme_colors = response?.user_profile?.theme_colors;
 const colorsArray = Object.values(theme_colors || {}).map((color) => `#${color.toString(16).padStart(6, "0")}`);
 const colorsString = colorsArray.join(", ");

 return {
  user: {
   id: response.user.id,
   createdAt: target.createdAt,
   createdTimestamp: target.createdTimestamp,
   username: response.user.username,
   tag: target.tag,
   global_name: response.user.global_name,
   legacy_username: response?.legacy_username || null,
   discriminator: response.user.discriminator,
   flags: response.user.flags,
   avatar: response.user.avatar,
   avatar_url: target.displayAvatarURL({ size: 4096, extension: "png", dynamic: true }),
   banner: response.user.banner,
   banner_url: bannerUrl,
  },
  user_profile: {
   bio: response?.user_profile?.bio || null,
   pronouns: response?.user_profile?.pronouns || null,
   theme_colors: colorsString || null,
  },
  nitro: {
   premium_type: response?.premium_type == 1 ? "nitro_classic" : response?.premium_type == 2 ? "nitro_boost" : response?.premium_type == 3 ? "nitro_basic" : null,
   premium_since: response?.premium_since,
   premium_guild_since: response?.premium_guild_since,
   current_badge: currentNitroBadgeData?.badge || null,
   current_badge_date: currentNitroBadgeData?.currentBadgeDate || null,
   next_badge: nextNitroBadgeData?.badge || null,
   next_badge_date: nextNitroBadgeData?.nextBadgeDate || null,
  },
  boost: {
   current_level: currentBoostLevel || null,
   current_level_date: response?.premium_guild_since || null,
   next_level: nextBoostLevel || null,
   next_level_date: nextDate || null,
  },
  badges: badges,
  connected_accounts: response?.connected_accounts,
 };
}

export { getUserResponse };