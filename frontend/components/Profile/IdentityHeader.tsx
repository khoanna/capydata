"use client";
import { Calendar, CheckCircle, Copy, Github, Globe, Settings, Share2, Star, Twitter, UserPlus } from "lucide-react";

import { truncateAddress, generateAvatarUrl, copyToClipboard, capyToUSD, formatUSD } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import Tooltip from "@/components/Common/Tooltip";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Image from "next/image";

interface IdentityHeaderProps {
  address: string;
}

const IdentityHeader = ({ address }: IdentityHeaderProps) => {
  const { addToast } = useToast();
  const currentAccount = useCurrentAccount();
  const isOwnProfile = currentAccount?.address === address;

  // Generate avatar URL from address using DiceBear
  const avatarUrl = generateAvatarUrl(address);

  // Mock user data
  const userData = {
    username: "DataScientist",
    bio: "Passionate about climate data and ML. Providing high-quality datasets for research and commercial use.",
    joinedDate: "Jan 2024",
    verified: true,
    stats: {
      published: 12,
      downloads: 347,
      earned: 15420,
      reputation: 94,
    },
    socials: {
      twitter: "@datascientist",
      github: "datascientist",
      website: "datascientist.io",
    },
  };

  const handleCopyAddress = async () => {
    await copyToClipboard(address);
    addToast("Address copied to clipboard!", "success");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userData.username} on CapyData`,
          text: userData.bio,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await copyToClipboard(window.location.href);
      addToast("Profile link copied!", "success");
    }
  };

  return (
    <div className="mb-8 reveal">
      <div className="glass-card p-8 rounded-lg">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar - Using DiceBear Pixel Art (Blockies/Jazzicons style) */}
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-panel">
              <Image
                src={avatarUrl}
                alt={`${userData.username} avatar`}
                width={128}
                height={128}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-sans font-bold text-white">
                    {userData.username}
                  </h1>
                  {userData.verified && (
                    <Tooltip content="Identity verified via GitHub" position="top">
                      <Badge variant="success" size="md">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </Badge>
                    </Tooltip>
                  )}
                </div>

                {/* Address with Copy Button */}
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 group mb-2"
                >
                  <span className="font-mono text-sm text-gray-400 group-hover:text-yuzu transition-colors">
                    {truncateAddress(address)}
                  </span>
                  <Copy className="w-3 h-3 text-gray-500 group-hover:text-yuzu transition-colors" />
                </button>

                {/* Joined Date - Separated for better visual hierarchy */}
                <div className="flex items-center gap-1.5 text-gray-500 mb-4">
                  <Calendar className="w-3 h-3" />
                  <span className="font-mono text-xs">Joined {userData.joinedDate}</span>
                </div>

                {/* Bio with max-width for better readability */}
                <p className="font-mono text-sm text-gray-400 max-w-[60ch] leading-relaxed">
                  {userData.bio}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isOwnProfile ? (
                  <Button variant="primary" size="md">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button variant="primary" size="md">
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </Button>
                )}
                <Button variant="outline" size="md" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats Grid - Improved contrast and clarity */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-300 mb-1">Published</p>
                <p className="font-sans text-2xl font-bold text-white">
                  {userData.stats.published}
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-300 mb-1">Downloads</p>
                <p className="font-sans text-2xl font-bold text-hydro">
                  {userData.stats.downloads}
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-300 mb-1">Total Earned</p>
                <p className="font-sans text-2xl font-bold text-yuzu">
                  {userData.stats.earned.toLocaleString()}
                  <span className="text-sm ml-1">CAPY</span>
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  ≈ {formatUSD(capyToUSD(userData.stats.earned))}
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-300 mb-1">Reputation</p>
                <div className="flex items-center gap-2">
                  <p className="font-sans text-2xl font-bold text-grass">
                    {userData.stats.reputation}<span className="text-base text-gray-500">/100</span>
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(userData.stats.reputation / 20)
                            ? "text-grass fill-grass"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links - Increased spacing from metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {userData.socials.twitter && (
                <a
                  href={`https://twitter.com/${userData.socials.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Twitter className="w-3 h-3" />
                  <span className="font-mono">{userData.socials.twitter}</span>
                </a>
              )}

              {userData.socials.github && (
                <a
                  href={`https://github.com/${userData.socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Github className="w-3 h-3" />
                  <span className="font-mono">{userData.socials.github}</span>
                </a>
              )}

              {userData.socials.website && (
                <a
                  href={`https://${userData.socials.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span className="font-mono">{userData.socials.website}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityHeader;
