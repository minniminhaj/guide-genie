export interface GuideStep {
    title: string;
    description: string;
}

export interface Guide {
    guideTitle: string;
    guideDescription: string;
    steps: GuideStep[];
}

export interface Language {
    label: string;
    display: string;
}

export interface DownloadOption {
    label: string;
    display: string;
}
