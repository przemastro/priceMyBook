// src/components/RateLimitStatus.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { getRateLimitStatus } from '../../utils/rateLimiter';
import { colors } from '@/styles/styles';
import { useTranslation } from 'react-i18next';

interface RateLimitStatusProps {
    style?: StyleProp<ViewStyle>;
    compact?: boolean;
}

export const RateLimitStatus = ({ style, compact = false }: RateLimitStatusProps) => {
    const { t } = useTranslation();
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        const loadStatus = async () => {
            const status = await getRateLimitStatus();

            if (!status) {
                setStatusText(t('rateLimit.noData'));
                return;
            }

            setStatusText(t('rateLimit.status', {
                used: status.used,
                limit: status.limit,
                remaining: status.remaining,
                resetDate: status.resetDate
            }));
        };

        loadStatus();
        const interval = setInterval(loadStatus, 60000);

        return () => clearInterval(interval);
    }, [t]);

    return (
        <View style={[
            styles.container,
            style,
            compact && styles.compactContainer
        ]}>
            <Text style={compact ? styles.compactText : styles.text}>
                {compact ? `API: ${statusText.split(' ')[2] || ''}` : statusText}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        backgroundColor: 'rgba(245,245,245,0.7)',
        borderRadius: 4,
    },
    compactContainer: {
        padding: 4,
    },
    text: {
        fontSize: 12,
        color: colors.gray,
    },
    compactText: {
        fontSize: 10,
        color: colors.gray,
    },
});