library('jsonlite')
library('plyr');

# Exclude two with bad data
phu_names <- as.factor(c(
    'APH'='The District of Algoma Health Unit',
    'BCHU'='Brant County Health Unit',
    'DRHD'='Durham Regional Health Unit',
    'GBHU'='Grey Bruce Health Unit',
    'HNHU'='Haldimand-Norfolk Health Unit',
    'HKPRDHU'='Haliburton, Kawartha, Pine Ridge District Health Unit',
    'HRHD'='Halton Regional Health Unit',
    'CHPHS'='City of Hamilton Health Unit',
    'HPE'='Hastings and Prince Edward Counties Health Unit',
#    'HCHU'='Huron County Health Unit',
    'CKPHS'='Chatham-Kent Health Unit',
    'KFLA'='Kingston, Frontenac and Lennox and Addington Health Unit',
    'CLCHSD'='Lambton Health Unit',
    'LGL'='Leeds, Grenville and Lanark District Health Unit',
    'MLHU'='Middlesex-London Health Unit',
    'NPHU'='Niagara Regional Area Health Unit',
    'NBPHU'='North Bay Parry Sound District Health Unit',
    'NWHU'='Northwestern Health Unit',
    'COHU'='City of Ottawa Health Unit',
    'PEEL'='Peel Public Health',
#    'PDHU'='Perth District Health Unit',
    'PCCHU'='Peterborough Public Health',
    'PHU'='Porcupine Health Unit',
    'RCDHU'='Renfrew County and District Health Unit',
    'EOHU'='The Eastern Ontario Health Unit',
    'SMDHU'='Simcoe Muskoka District Health Unit',
    'SWPH'='Southwestern Public Health',
    'SDHU'='Sudbury and District Health Unit',
    'TBPHU'='Thunder Bay District Health Unit',
    'THU'='Timiskaming Health Unit',
    'WHU'='Waterloo Health Unit',
    'WDGHU'='Wellington-Dufferin-Guelph Health Unit',
    'WECHU'='Windsor-Essex County Health Unit',
    'YRHU'='York Regional Health Unit',
    'TOR'='Toronto Public Health'
));
names(phu_names) <- as.factor(names(phu_names));
phus <- names(phu_names);

lhin_names = as.factor(c(
    '3501'='Erie St. Clair',
    '3502'='South West',
    '3503'='Waterloo Wellington',
    '3504'='Hamilton Niagara Haldimand Brant',
    '3505'='Central West',
    '3506'='Mississauga Halton',
    '3507'='Toronto Central',
    '3508'='Central',
    '3509'='Central East',
    '3510'='South East',
    '3511'='Champlain',
    '3512'='North Simcoe Muskoka',
    '3513'='North East',
    '3514'='North West'
));
names(lhin_names) <- as.factor(names(lhin_names));
lhins <- names(lhin_names);

read <- function(codes) {
    result <- data.frame();
    for (code in codes) {
        temp <- fromJSON(paste('raw/', as.character(code), '.json', sep=''), flatten=TRUE);
        temp$Phu <- code;
        if(nrow(result) > 0) {
            result <- rbind(result, temp);
        } else {
            result <- temp;
        }
    }
    result$AdmissionDate <- as.Date(result$AdmissionDate);
    result$PctResp <- as.numeric(result$PctResp) / 100;
    result;
}

phudata <- read(phus);
phudata$PhuName <- phu_names[phudata$Phu];

lhindata <- read(lhins);
lhindata <- rename(lhindata, c('Phu'='Lhin'));
lhindata$LhinName <- lhin_names[lhindata$Lhin];

write.csv(xtabs(PctResp~AdmissionDate + PhuName, phudata), 'output/phu_pctresp.csv');
write.csv(xtabs(RespVisits~AdmissionDate + PhuName, phudata), 'output/phu_respvisits.csv');
write.csv(phudata, 'output/phu.csv');

write.csv(xtabs(PctResp~AdmissionDate + LhinName, lhindata), 'output/lhin_pctresp.csv');
write.csv(xtabs(RespVisits~AdmissionDate + LhinName, lhindata), 'output/lhin_respvisits.csv');
write.csv(phudata, 'output/lhin.csv');
