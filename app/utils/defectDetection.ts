import * as FileSystem from 'expo-file-system';
import { BookDefect } from '../components/analysisScreen/types';

type DefectConfig = {
    icon: string;
    color: string;
    reduction: number;
};

const DEFECTS_CONFIG: Record<string, DefectConfig> = {
    heavyWear: { icon: 'alert-circle-outline', color: '#2c3e50', reduction: 10 },
    foldedCorners: { icon: 'copy-outline', color: '#1abc9c', reduction: 3 },
    tornPages: { icon: 'document-text-outline', color: '#e74c3c', reduction: 10 },
    writingMarks: { icon: 'pencil-outline', color: '#8e44ad', reduction: 5 },
    stainedPages: { icon: 'color-filter-outline', color: '#e67e22', reduction: 7 },
    brokenSpine: { icon: 'book-outline', color: '#d35400', reduction: 8 },
    missingPages: { icon: 'remove-circle-outline', color: '#c0392b', reduction: 5 },
    looseBinding: { icon: 'link-outline', color: '#16a085', reduction: 9 },
    fadedCover: { icon: 'contrast-outline', color: '#7f8c8d', reduction: 4 }
};

export const detectBookDefects = async (imageUri: string): Promise<BookDefect[]> => {
    const defects: BookDefect[] = [];

    try {
        // 1. Pobierz informacje o zdjęciu z rozmiarem
        const imageInfo = await FileSystem.getInfoAsync(imageUri, { size: true });

        if (!imageInfo.exists) {
            console.warn('Image file does not exist');
            return defects;
        }

        // 2. Type guard dla sprawdzenia czy size istnieje
        const imageSize = 'size' in imageInfo ? imageInfo.size : 0;

        // 3. Wykrywanie podstawowych wad na podstawie rozmiaru zdjęcia
        if (imageSize > 2_000_000) {
            defects.push(createDefect('heavyWear', 85));
        }

        // 4. Symulacja wykrywania innych wad
        const randomDefects = Object.keys(DEFECTS_CONFIG)
            .filter(() => Math.random() > 0.7)
            .slice(0, 2);

        randomDefects.forEach(defectId => {
            defects.push(createDefect(defectId, Math.floor(Math.random() * 30) + 70));
        });

    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }

    return defects;
};

const createDefect = (id: keyof typeof DEFECTS_CONFIG, confidence: number): BookDefect => {
    const config = DEFECTS_CONFIG[id];
    return {
        id,
        selected: true,
        priceReduction: config.reduction,
        count: 1,
        confidence,
        icon: config.icon,
        color: config.color
    };
};