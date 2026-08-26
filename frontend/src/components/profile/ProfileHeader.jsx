import React, { useRef } from 'react';
import { Edit3, MapPin, Mail, Phone, Globe, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const ProfileHeader = ({
  profile,
  user,
  onEditProfile,
  onUploadAvatar,
  uploadingAvatar = false,
  className = '',
}) => {
  const fileInputRef = useRef(null);

  // Extract name fallbacks
  const firstName = profile?.firstName || user?.firstName || '';
  const lastName = profile?.lastName || user?.lastName || '';
  const fullName =
    profile?.fullName ||
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.name || 'Candidate Name');

  const email = user?.email || profile?.user?.email || 'Email not provided';
  const phone = profile?.phone || user?.phone || profile?.user?.phone || '';
  const headline = profile?.headline || 'Set your target role & career headline';
  const currentLocation = profile?.currentLocation || '';
  const preferredLocation = profile?.preferredLocation || '';
  const website = profile?.website || '';
  const role = user?.role || profile?.user?.role || 'Candidate';
  const avatarUrl = profile?.profileImage || profile?.user?.profileImage || '';

  const handleAvatarClick = () => {
    if (fileInputRef.current && !uploadingAvatar) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      onUploadAvatar(file);
    }
    // Reset file input value to allow selecting same file again if needed
    e.target.value = '';
  };

  return (
    <Card variant="glass" className={`relative overflow-hidden border-slate-800 ${className}`.trim()}>
      {/* Background Ambient Glow Accent */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/jpg"
              className="hidden"
            />
            <div className="relative rounded-full ring-4 ring-indigo-500/20 p-1 bg-slate-900/80 shadow-2xl">
              <Avatar
                src={avatarUrl}
                name={fullName}
                size="xl"
                className="w-24 h-24 sm:w-28 sm:h-28 text-2xl font-black ring-2 ring-indigo-400/30"
              />

              {/* Upload Avatar Overlay Button */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                title="Change profile avatar"
                className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white backdrop-blur-xs cursor-pointer border border-indigo-400/40"
              >
                <Camera className="w-6 h-6 mb-1 text-indigo-300 animate-bounce" />
                <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-200">
                  {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                </span>
              </button>
            </div>

            {/* Role / Status Badge */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0">
              <Badge variant="primary" style="gradient" size="xs" className="px-2 py-0.5 shadow-lg border border-indigo-400/40 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 mr-1 text-cyan-300 inline" />
                {role}
              </Badge>
            </div>
          </div>

          {/* User Details & Headlines */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {fullName}
                </h1>
                {profile?.profileImage && (
                  <span title="Verified Avatar Profile">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg font-medium text-indigo-300/90 leading-snug">
                {headline}
              </p>
            </div>

            {/* Quick Contact & Location Meta Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs text-slate-300">
              {email && (
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[260px]">{email}</span>
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{phone}</span>
                </div>
              )}

              {(currentLocation || preferredLocation) && (
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    {currentLocation}
                    {currentLocation && preferredLocation ? ` • Prefers: ${preferredLocation}` : preferredLocation}
                  </span>
                </div>
              )}

              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[180px]">{website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto md:w-auto mt-2 md:mt-0">
            {onEditProfile && (
              <Button
                variant="primary"
                size="md"
                onClick={onEditProfile}
                leftIcon={<Edit3 className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-lg shadow-indigo-600/25"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
