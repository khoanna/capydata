"use client";

import { truncateAddress, stringToColor, copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface IdentityHeaderProps {
  address: string;
}

const IdentityHeader = ({ address }: IdentityHeaderProps) => {
  const { addToast } = useToast();
  const currentAccount = useCurrentAccount();
  const isOwnProfile = currentAccount?.address === address;

  // Generate avatar gradient from address
  const avatarGradient = stringToColor(address);

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
    <div className="mb-12 reveal">
      <div className="glass-card p-8 rounded-lg">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-sans font-bold text-white border-4 border-white/10"
              style={{ background: avatarGradient }}
            >
              {userData.username.slice(0, 2).toUpperCase()}
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
                    <Badge variant="success" size="md">
                      <i data-lucide="check-circle" className="w-4 h-4"></i>
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Address */}
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 group mb-3"
                >
                  <span className="font-mono text-sm text-gray-400 group-hover:text-yuzu transition-colors">
                    {truncateAddress(address)}
                  </span>
                  <i data-lucide="copy" className="w-3 h-3 text-gray-500 group-hover:text-yuzu transition-colors"></i>
                </button>

                <p className="font-mono text-sm text-gray-400 max-w-2xl leading-relaxed">
                  {userData.bio}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isOwnProfile ? (
                  <Button variant="outline" size="md">
                    <i data-lucide="settings" className="w-4 h-4"></i>
                    Edit Profile
                  </Button>
                ) : (
                  <Button variant="primary" size="md">
                    <i data-lucide="user-plus" className="w-4 h-4"></i>
                    Follow
                  </Button>
                )}
                <Button variant="ghost" size="md" onClick={handleShare}>
                  <i data-lucide="share-2" className="w-4 h-4"></i>
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Published</p>
                <p className="font-sans text-2xl font-bold text-white">
                  {userData.stats.published}
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Downloads</p>
                <p className="font-sans text-2xl font-bold text-hydro">
                  {userData.stats.downloads}
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Total Earned</p>
                <p className="font-sans text-2xl font-bold text-yuzu">
                  {userData.stats.earned.toLocaleString()}
                  <span className="text-sm ml-1">CAPY</span>
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Reputation</p>
                <div className="flex items-center gap-2">
                  <p className="font-sans text-2xl font-bold text-grass">
                    {userData.stats.reputation}
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        data-lucide="star"
                        className={`w-4 h-4 ${
                          star <= Math.floor(userData.stats.reputation / 20)
                            ? "text-grass fill-grass"
                            : "text-gray-600"
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Socials & Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <i data-lucide="calendar" className="w-3 h-3"></i>
                <span className="font-mono">Joined {userData.joinedDate}</span>
              </div>

              {userData.socials.twitter && (
                <a
                  href={`https://twitter.com/${userData.socials.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <i data-lucide="twitter" className="w-3 h-3"></i>
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
                  <i data-lucide="github" className="w-3 h-3"></i>
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
                  <i data-lucide="globe" className="w-3 h-3"></i>
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
