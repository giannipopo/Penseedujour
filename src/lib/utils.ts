import { formatInTimeZone } from 'date-fns-tz';

/**
 * Returns the current date key in 'YYYY-MM-DD' format for Europe/Paris timezone.
 */
export function getDateKeyParis(date: Date = new Date()): string {
    return formatInTimeZone(date, 'Europe/Paris', 'yyyy-MM-dd');
}

/**
 * Validates the thought content.
 */
export function validateThoughtContent(content: string): string | null {
    const trimmed = content.trim();
    if (!trimmed) return "Le contenu ne peut pas être vide.";
    if (trimmed.length > 280) return "Le contenu ne peut pas dépasser 280 caractères.";
    return null;
}
