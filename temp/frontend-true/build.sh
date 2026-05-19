#!/bin/bash

projects=("admin" "education" "kitchen" "laboratory" "load" "personnel" "support" "transport" "warehouse" )

for project in ${projects[@]}; do
    echo '------------------------------------------'
    echo ${project^^}

    ng build ${project}
done