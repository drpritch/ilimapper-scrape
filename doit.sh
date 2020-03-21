#!/bin/sh
export PHUs="APH BCHU DRHD GBHU HNHU HKPRDHU HRHD CHPHS HPE HCHU CKPHS KFLA
    CLCHSD LGL MLHU NPHU NBPHU NWHU COHU PEEL PDHU PCCHU PHU RCDHU EOHU SMDHU
    SWPH SDHU TBPHU THU WHU WDGHU WECHU YRHU TOR"
for PHU in $PHUs; do
    wget -O - https://aces.kflaphi.ca/aces/ILIMapper/getPercentages?PHU=$PHU \
        | json_pp \
        > $PHU.json
done
