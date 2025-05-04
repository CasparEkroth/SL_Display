#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

#define STATION_NAME_LEN 64
#define COUNT_RETURN_STATIONS 5

typedef struct {
    char *stationId;
    int score;
} ListScore;

// Convert src to lowercase into dst
static void toLowerCase(const char *src, char *dst) {
    for (int i = 0; src[i]; i++) {
        dst[i] = tolower((unsigned char)src[i]);
    }
    dst[strlen(src)] = '\0';
}

// Comparator for qsort: ascending by score
static int cmpScore(const void *a, const void *b) {
    const ListScore *pa = a;
    const ListScore *pb = b;
    return pa->score - pb->score;
}

// Build an array of ListScore with computed scores, then sort
static ListScore* match(const char *input, char **list, int count) {
    int inputLen = strlen(input);
    if (inputLen == 0) return NULL;

    // Lowercase copy of input
    char *lowerInput = malloc(inputLen + 1);
    toLowerCase(input, lowerInput);

    ListScore *matches = malloc(count * sizeof(ListScore));
    if (!matches) {
        free(lowerInput);
        return NULL;
    }

    for (int i = 0; i < count; i++) {
        // Copy station name
        matches[i].stationId = strdup(list[i]);
        matches[i].score = 0;

        // Lowercase station name
        char *lowerName = malloc(strlen(list[i]) + 1);
        toLowerCase(list[i], lowerName);

        // Prefix match scores highest
        if (strncmp(lowerName, lowerInput, inputLen) == 0) {
            matches[i].score = inputLen * 10;
        }
        // Substring match gets moderate score
        else if (strstr(lowerName, lowerInput)) {
            matches[i].score = inputLen;
        }
        free(lowerName);
    }

    free(lowerInput);

    // Sort ascending, so highest scores are at the end
    qsort(matches, count, sizeof(ListScore), cmpScore);
    return matches;
}

char** fuzzySearch(char *input, char **list, int count) {
    if (!input || !*input) return NULL;

    ListScore *scores = match(input, list, count);
    if (!scores) return NULL;

    int realCount = count < COUNT_RETURN_STATIONS ? count : COUNT_RETURN_STATIONS;
    char **top = malloc(COUNT_RETURN_STATIONS * sizeof(char*));
    if (!top) {
        // cleanup
        for (int i = 0; i < count; i++) free(scores[i].stationId);
        free(scores);
        return NULL;
    }

    // Take highest scores from the end
    for (int i = 0; i < realCount; i++) {
        top[i] = strdup(scores[count - 1 - i].stationId);
    }
    // Fill remaining with empty strings
    for (int i = realCount; i < COUNT_RETURN_STATIONS; i++) {
        top[i] = strdup("");
    }

    // Free intermediate matches
    for (int i = 0; i < count; i++) free(scores[i].stationId);
    free(scores);
    return top;
}

void freeFuzzyResults(char **results) {
    if (!results) return;
    for (int i = 0; i < COUNT_RETURN_STATIONS; i++) {
        free(results[i]);
    }
    free(results);
}
