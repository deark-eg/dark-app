import { FC } from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
  withText?: boolean;
  variant?: 'header' | 'footer' | 'registration' | 'splash';
}

export const Logo: FC<LogoProps> = ({ className = 'w-12 h-12', light = false, withText = true, variant }) => {
  const goldColor = '#C9A14A';
  const navyColor = light ? '#FFFFFF' : '#163B63';

  // The new custom dark/blue premium logo variant from Google Drive (ideal for dark footer, splash screen, and registration card header)
  const isCustomDarkTheme = variant === 'footer' || variant === 'registration' || variant === 'splash' || light;
  const logoUrl = isCustomDarkTheme 
    ? 'https://lh3.googleusercontent.com/d/1vvU62DiXRqf_r4KvORvviYgGHcBDIjKQ'
    : 'https://lh3.googleusercontent.com/d/1p12-eR38pN7jrYDNQm0-nr98igfoFl0z';

  // If using the wide, horizontal custom banner logo, we adjust layout classes
  if (isCustomDarkTheme) {
    let imgClass = "h-14 sm:h-18 md:h-22 w-auto object-contain transition-all duration-300 transform hover:scale-[1.03]";
    if (variant === 'splash') {
      imgClass = "h-24 sm:h-28 md:h-32 w-auto object-contain transition-all duration-300 transform hover:scale-[1.03]";
    } else if (variant === 'header' || (!variant && light)) {
      imgClass = "h-9 sm:h-12 w-auto object-contain transition-all duration-300 transform hover:scale-[1.03]";
    }

    return (
      <div className="flex items-center select-none">
        <img
          src={logoUrl}
          alt="Dark Real Estate Premium Logo"
          referrerPolicy="no-referrer"
          className={imgClass}
          onError={(e) => {
            // Graceful fallback to original logo if Google Drive link encounters any transient restriction
            e.currentTarget.src = 'https://lh3.googleusercontent.com/d/1p12-eR38pN7jrYDNQm0-nr98igfoFl0z';
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src={logoUrl}
        alt="Dark Real Estate Logo"
        referrerPolicy="no-referrer"
        className={`${className} object-contain transition-all duration-300 transform hover:scale-105`}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
      
      {withText && (
        <div className="flex flex-col items-start leading-none">
          <span 
            className="text-xl font-bold tracking-wide font-arabic" 
            style={{ color: navyColor }}
          >
            دارك
          </span>
          <span 
            className="text-[10px] font-semibold tracking-widest font-sans mt-0.5" 
            style={{ color: goldColor }}
          >
            للخدمات العقارية
          </span>
        </div>
      )}
    </div>
  );
};
