#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#define STATION_NAME_LEN 50
#define MAX_MATCHES 20
#define COUNT_RETURN_STATIONS 10

typedef struct{
    char *stationId;
    int score;
}ListScore;

ListScore* match(char *input, char **list, int count);
ListScore* score(char *input, char matches[][STATION_NAME_LEN]);
static void destroyListScore(ListScore* matches,int count);


char** fuzzySearch(char* input, char **list, int count){
    ListScore *matches ={0};
    //match letter in order but not exact 
    matches = match(input,list,count);
    //how "good" was the match is (closer = better)
    //list = score(input,matches);
    //sort = best matches first

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

ListScore* score(char *input, char matches[][STATION_NAME_LEN]){
    ListScore list[COUNT_RETURN_STATIONS] = {0};

    return list;
}

char** sort(ListScore *list){
    
}


int add(int a, int b){
    return (a + b);
}