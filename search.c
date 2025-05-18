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

static void toLowerCase(const char *src, char *dst) {
    for (int i = 0; src[i]; i++) {
        dst[i] = tolower((unsigned char)src[i]);
    }
    dst[strlen(src)] = '\0';
}

static int cmpScore(const void *a, const void *b) {
    const ListScore *pa = a;
    const ListScore *pb = b;
    return pa->score - pb->score;
}

static ListScore* match(const char *input, char **list, int count) {
    int inputLen = strlen(input);
    if (inputLen == 0) return NULL;

    char *lowerInput = malloc(inputLen + 1);
    toLowerCase(input, lowerInput);

    ListScore *matches = malloc(count * sizeof(ListScore));
    if (!matches) {
        free(lowerInput);
        return NULL;
    }

    for (int i = 0; i < count; i++) {
        matches[i].stationId = strdup(list[i]);
        matches[i].score = 0;

        char *lowerName = malloc(strlen(list[i]) + 1);
        toLowerCase(list[i], lowerName);

        if (strncmp(lowerName, lowerInput, inputLen) == 0) {
            matches[i].score = inputLen * 10;
        }
        else if (strstr(lowerName, lowerInput)) {
            matches[i].score = inputLen;
        }
        free(lowerName);
    }

    free(lowerInput);

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
        for (int i = 0; i < count; i++) free(scores[i].stationId);
        free(scores);
        return NULL;
    }

    for (int i = 0; i < realCount; i++) {
        top[i] = strdup(scores[count - 1 - i].stationId);
    }
    for (int i = realCount; i < COUNT_RETURN_STATIONS; i++) {
        top[i] = strdup("");
    }

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
