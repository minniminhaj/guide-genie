import React from "react";
import CustomDropdownMenu from "./CustomDropdownMenu";
import { Language, DownloadOption } from "../types";

interface HeaderProps {
  isLoading: boolean;
  selectedLang: Language;
  languageList: DownloadOption[];
  downloadList: DownloadOption[];
  onDownload: (option: DownloadOption) => void;
  onLanguageSelect: (language: Language) => void;
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  selectedLang,
  downloadList,
  languageList,
  onDownload,
  onLanguageSelect,
}) => {
  return (
    <div className="header">
      <img src="guide-genie.png" width="120" alt="guide-genie-logo" />
      <div className="action-btn">
        <CustomDropdownMenu
          disabled={isLoading}
          menuItems={downloadList}
          onMenuItemClick={onDownload}
          buttonLabel="Download"
        />
        <CustomDropdownMenu
          disabled={isLoading}
          menuItems={languageList}
          onMenuItemClick={onLanguageSelect}
          buttonLabel={`Language (${selectedLang.display})`}
        />
      </div>
    </div>
  );
};

export default Header;
