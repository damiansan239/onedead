import {
  ChevronLeftIcon,
  FingerPrintIcon,
  InformationCircleIcon,
  SpeakerWaveIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import startupSoundService from "../services/startupSound";

interface SettingsProps {
  onBack: () => void;
}

interface IOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const IOSSwitch = ({
  checked,
  onChange,
}: IOSSwitchProps): React.ReactElement => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-7.75 w-12.75 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-250 ease-in-out focus:outline-none
        ${checked ? "bg-[#34c759]" : "bg-[#e9e9eb]"}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-6.75 w-[27px] transform rounded-full bg-white shadow-sm ring-0 
          transition duration-250 ease-in-out
          ${checked ? "translate-x-[20px]" : "translate-x-0"}
        `}
      />
    </button>
  );
};

// ─── Settings Main Component ─────────────────────────────────────────────
const Settings = ({ onBack }: SettingsProps): React.ReactElement => {
  const [soundOn, setSoundOn] = React.useState<boolean>(
    () => startupSoundService.isSoundEnabled,
  );
  const [hapticOn, setHapticOn] = React.useState<boolean>(true);

  const handleToggleSound = React.useCallback((checked: boolean) => {
    setSoundOn(checked);
    if (checked) {
      startupSoundService.resume();
    } else {
      startupSoundService.pause();
    }
  }, []);

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-gray-100">
      <main className="relative flex h-screen w-full flex-col overflow-hidden border-x-2 border-gray-300 bg-[#f2f2f7] sm:w-8/12 md:w-5/12 animate-fade-in">
        {/* Navigation Bar (iOS style) */}
        <div className="relative flex h-11 items-center justify-between border-b border-gray-200/80 bg-[#f2f2f7]/95 px-2 backdrop-blur-md">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-[#007aff] transition active:opacity-50 select-none"
          >
            <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            <span className="text-[17px] -ml-1">Home</span>
          </button>

          {/* Title */}
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-black">
            Settings
          </span>

          {/* Right Spacer */}
          <div className="w-12" />
        </div>

        {/* Scrollable Settings Container */}
        <div className="flex-1 overflow-y-auto pb-8">
          {/* Section 1: Gameplay Audio/Haptics */}
          <div className="mt-8">
            <span className="px-4 text-[13px] font-normal uppercase tracking-wider text-gray-500">
              Gameplay
            </span>
            <div className="mt-2 mx-4 overflow-hidden rounded-xl bg-white shadow-xs">
              {/* Row: Sound Effects */}
              <div className="flex items-center justify-between px-4 py-[11px] bg-white">
                <div className="flex items-center">
                  <div className="flex h-[29px] w-[29px] items-center justify-center rounded-md bg-[#ff3b30] text-white">
                    <SpeakerWaveIcon className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-[17px] font-normal text-black">
                    Sound Effects
                  </span>
                </div>
                <IOSSwitch checked={soundOn} onChange={handleToggleSound} />
              </div>

              {/* Thin iOS line separator */}
              <div className="h-[1px] bg-gray-100 ml-14" />

              {/* Row: Haptic Feedback */}
              <div className="flex items-center justify-between px-4 py-[11px] bg-white">
                <div className="flex items-center">
                  <div className="flex h-[29px] w-[29px] items-center justify-center rounded-md bg-[#5856d6] text-white">
                    <FingerPrintIcon className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-[17px] font-normal text-black">
                    Haptics
                  </span>
                </div>
                <IOSSwitch checked={hapticOn} onChange={setHapticOn} />
              </div>
            </div>
            <p className="mt-2 px-4 text-[13px] font-normal leading-normal text-gray-500">
              Plays background music and user interface sounds. Haptic vibration
              is triggered on selection.
            </p>
          </div>

          {/* Section 2: App Info */}
          <div className="mt-8">
            <span className="px-4 text-[13px] font-normal uppercase tracking-wider text-gray-500">
              About
            </span>
            <div className="mt-2 mx-4 overflow-hidden rounded-xl bg-white shadow-xs">
              {/* Developer */}
              <div className="flex items-center justify-between px-4 py-[11px] bg-white">
                <div className="flex items-center">
                  <div className="flex h-[29px] w-[29px] items-center justify-center rounded-md bg-[#007aff] text-white">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-[17px] font-normal text-black">
                    Developer
                  </span>
                </div>
                <span className="text-[17px] font-normal text-gray-400">
                  Damian Akpan
                </span>
              </div>

              <div className="h-[1px] bg-gray-100 ml-14" />

              {/* Version */}
              <div className="flex items-center justify-between px-4 py-[11px] bg-white">
                <div className="flex items-center">
                  <div className="flex h-[29px] w-[29px] items-center justify-center rounded-md bg-[#8e8e93] text-white">
                    <InformationCircleIcon className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-[17px] font-normal text-black">
                    Version
                  </span>
                </div>
                <span className="text-[17px] font-normal text-gray-400">
                  1.0.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
