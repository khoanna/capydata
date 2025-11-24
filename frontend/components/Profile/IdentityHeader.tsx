"use client";
import { Calendar, CheckCircle, Copy, Github, Globe, Settings, Share2, Star, Twitter, UserPlus, User } from "lucide-react";

import { truncateAddress, stringToColor, copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/Common/Badge";
import { useAppContext } from "@/context/AppContext";

interface IdentityHeaderProps {
  address: string;
}

const IdentityHeader = ({ address }: IdentityHeaderProps) => {
  const { addToast } = useToast();

  // Generate avatar gradient from address
  const avatarGradient = stringToColor(address);

  // Live data from AppContext (replace previous hardcoded/mock user data)
  const { allListings } = useAppContext();

  const publishedAssets = allListings?.filter((asset) => asset.owner === address) || [];

  const publishedCount = publishedAssets.length;
  const downloads = publishedAssets.reduce((sum, a) => Number(sum) + (Number(a.amount_sold) || 0), 0);
  
  const earned = publishedAssets.reduce((sum, a) => sum + (a.price || 0) * (Number(a.amount_sold) || 0), 0);
  const reputation = Math.min(
    100,
    Math.round(Math.log10(1 + downloads) * 20 + publishedCount * 3)
  );

  const username = truncateAddress(address);
  const bio = publishedCount > 0 ? `Publisher of ${publishedCount} dataset${publishedCount !== 1 ? "s" : ""}` : "";
  const isVerified = publishedCount > 0; // simple heuristic — adjust as you add real profile data
  const socials: { twitter?: string; github?: string; website?: string } = {};
  // initials removed — avatar will show an icon instead of text

  const handleCopyAddress = async () => {
    await copyToClipboard(address);
    addToast("Address copied to clipboard!", "success");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username} on CapyData`,
          text: bio,
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
          <div className="shrink-0">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-white border-4 border-white/10"
              style={{ background: avatarGradient }}
              aria-hidden
            >
              <User className="w-12 h-12 text-white opacity-95" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-sans font-bold text-white">
                    {username}
                  </h1>
                </div>

                {/* Address */}
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 group mb-3"
                >
                  <span className="font-mono text-sm text-gray-400 group-hover:text-yuzu transition-colors">
                    {truncateAddress(address)}
                  </span>
                  <Copy className="w-3 h-3 text-gray-500 group-hover:text-yuzu transition-colors" />
                </button>

                <p className="font-mono text-sm text-gray-400 max-w-2xl leading-relaxed">
                  {bio || ""}
                </p>
              </div>

                  {isVerified && (
                    <Badge variant="success" size="md">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </Badge>
                  )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Published</p>
                <p className="font-sans text-2xl font-bold text-white">{publishedCount}</p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Downloads</p>
                <p className="font-sans text-2xl font-bold text-hydro">{downloads}</p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Total Earned</p>
                <p className="font-sans text-2xl font-bold text-yuzu">
                  {earned.toLocaleString()}
                  <span className="text-sm ml-1">SUI</span>
                </p>
              </div>
              <div className="p-4 glass-input rounded-lg">
                <p className="font-mono text-xs text-gray-400 mb-1">Reputation Point</p>
                <div className="flex items-center gap-2">
                  <p className="font-sans text-2xl font-bold text-grass">{reputation}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(reputation / 20) ? "text-grass fill-grass" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Socials & Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {socials.twitter && (
                <a
                  href={`https://twitter.com/${socials.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Twitter className="w-3 h-3" />
                  <span className="font-mono">{socials.twitter}</span>
                </a>
              )}

              {socials.github && (
                <a
                  href={`https://github.com/${socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Github className="w-3 h-3" />
                  <span className="font-mono">{socials.github}</span>
                </a>
              )}

              {socials.website && (
                <a
                  href={`https://${socials.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-hydro transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span className="font-mono">{socials.website}</span>
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
