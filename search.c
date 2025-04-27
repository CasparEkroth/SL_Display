#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#define STATION_NAME_LEN 64
#define MAX_MATCHES 20
#define COUNT_RETURN_STATIONS 5

typedef struct{
    char *stationId;
    int score;
}ListScore;

ListScore* match(char *input, char **list, int count);
static void destroyListScore(ListScore* matches,int count);
void merge(ListScore *matches, int left, int mid, int right);
void divideAndConquer(ListScore *matches, int left, int right);


char** fuzzySearch(char* input, char **list, int count){
    ListScore *matches ={0};
    matches = match(input,list,count);
    if(matches == NULL) return NULL; 

    divideAndConquer(matches,0,count-1);
    char **topScore = malloc(COUNT_RETURN_STATIONS * sizeof(char *));
    if(!topScore) return NULL;

     int realCount = count < COUNT_RETURN_STATIONS ? count : COUNT_RETURN_STATIONS;

    for (int i = 0; i < realCount; i++){
        const char *src = matches[count - 1 - i].stationId;
        topScore[i] = strdup(src);
        if(!topScore[i]){
            while (i--) free(topScore[i]);
            free(topScore);
            return NULL;
        }
    }
    for (int i = realCount; i < COUNT_RETURN_STATIONS; i++){
        topScore[i] = strdup("");
        if (!topScore[i]) {
            while (i--) free(topScore[i]);
            free(topScore);
            return NULL;
        }
    }
    destroyListScore(matches,count);
    return topScore;
}

void freeFuzzyResults(char **results) {
    if (!results) return;
    for (int i = 0; i < COUNT_RETURN_STATIONS; i++) {
        free(results[i]);
    }
    free(results);
}

ListScore* match(char *input, char **list, int count){
    ListScore* matches = malloc(count * sizeof(ListScore));
    if(matches == NULL) return NULL;
    int inputLen = (int)strlen(input);
    for (int i = 0; i < count; i++){
        matches[i].stationId = malloc(STATION_NAME_LEN);
        if (!matches[i].stationId) return NULL;
        memcpy(matches[i].stationId,list[i],STATION_NAME_LEN);
        matches[i].score = 0;

        for (int j = 0; j < (int)strlen(list[i]); j++){
            for (int y = 0; y < inputLen; y++){
                if(list[i][j] == input[y]){
                    matches[i].score++;
                }
            }
        }
    }
    return matches;
}

static void destroyListScore(ListScore* matches,int count){
    for (int i = 0; i < count; i++){
        if(matches[i].stationId) free(matches[i].stationId);
    }
    free(matches);
}

void merge(ListScore *matches, int left, int mid, int right){
    int n1 = mid - left + 1; 
    int n2 = right - mid;
    ListScore *temp = malloc((n1 + n2) * sizeof(ListScore));
    ListScore *L = temp;
    ListScore *R = temp + n1;
    // Deep copy data
    for (int i = 0; i < n1; i++) {
        L[i] = matches[left + i];
        L[i].stationId = strdup(matches[left + i].stationId);
    }
    for (int j = 0; j < n2; j++) {
        R[j] = matches[mid + 1 + j];
        R[j].stationId = strdup(matches[mid + 1 + j].stationId);
    }
    // Merge the two temporary arrays back into array[left..right]
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i].score <= R[j].score) {
            matches[k++] = L[i++];
        } else {
            matches[k++] = R[j++];
        }
    }
    // Copy remaining elements
    while (i < n1) {
        matches[k++] = L[i++];
    }
    while (j < n2) {
        matches[k++] = R[j++];
    }
    
    for (int i = 0; i < n1; i++){
        free(L[i].stationId);
    }
    for (int j = 0; j < n2; j++){
        free(R[j].stationId);
    }
    free(L);
    free(R);
}

void divideAndConquer(ListScore *matches, int left, int right){
    if (left < right){
        int mid = left + (right - left) / 2; 
        // Sort first and second halves
        divideAndConquer(matches, left, mid);
        divideAndConquer(matches, mid + 1, right);
        // Merge the sorted halves
        merge(matches, left, mid, right);
    }
}