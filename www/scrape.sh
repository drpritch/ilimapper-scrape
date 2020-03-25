#!/bin/sh
DATES2019="09-01 09-08 09-15 09-22 09-29 10-06 10-13 10-20 10-27 11-03
11-10 11-17 11-24 12-01 12-08 12-15 12-22 12-29"
DATES2020="01-05 01-12 01-19 01-26 02-02 02-09 02-16 02-23 03-01 03-08
03-15 03-22 03-29 04-05 04-12 04-19 04-26 05-03 05-10 05-17 05-24 06-07
06-14 06-21 06-28"


# http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/KFLA/ows?&request=GetMap&srs=EPSG%3A3857&service=WMS&layers=KFLA%3Aili_mapper&format=application%2Fvnd.google-earth.kml%2Bxml&version=1.1.0&styles=&bbox=-10994056.155390117%2C5090462.471517131%2C-7662624.71460988%2C7746802.07848287&viewparams=ClassID%3AResp%3BWeekAdmission%3A$DATE%3BGeoType%3APHU&height=1&width=1
# http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/KFLA/ows?&request=GetMap&srs=EPSG%3A3857&service=WMS&layers=KFLA%3Aili_mapper_lhin&format=application%2Fvnd.google-earth.kml%2Bxml&version=1.1.0&styles=&bbox=-10994056.155390117%2C5090462.471517131%2C-7662624.71460988%2C7746802.07848287&viewparams=ClassID%3AResp%3BWeekAdmission%3A$DATE%3BGeoType%3ALHIN&height=1&width=1
BASEURL="http://proxy.kflaphi.ca/?http://geo2.kflaphi.ca/geoserver/KFLA/ows?&request=GetMap&srs=EPSG%3A3857&service=WMS"
URLPARAMS1="format=application%2Fvnd.google-earth.kml%2Bxml&version=1.1.0&styles=&bbox=-10994056.155390117%2C5090462.471517131%2C-7662624.71460988%2C7746802.07848287"
VIEWPARAMS="viewparams=ClassID%3AResp%3BWeekAdmission%3A"
URLPARAMS2="height=1&width=1"
for DATE in $DATES2019; do
    DATE=2019-$DATE;
    wget -O KFLA-ili_mapper_$DATE.kml "$BASEURL&layers=KFLA%3Aili_mapper&$URLPARAMS1&$VIEWPARAMS$DATE%3BGeoType%3APHU&$URLPARAMS2"
    wget -O KFLA-ili_mapper_lhin_$DATE.kml "$BASEURL&layers=KFLA%3Aili_mapper_lhin&$URLPARAMS1&$VIEWPARAMS$DATE%3BGeoType%3ALHIN&$URLPARAMS2"
done
for DATE in $DATES2020; do
    DATE=2020-$DATE;
    wget -O KFLA-ili_mapper_$DATE.kml "$BASEURL&layers=KFLA%3Aili_mapper&$URLPARAMS1&$VIEWPARAMS$DATE%3BGeoType%3APHU&$URLPARAMS2"
    wget -O KFLA-ili_mapper_lhin_$DATE.kml "$BASEURL&layers=KFLA%3Aili_mapper_lhin&$URLPARAMS1&$VIEWPARAMS$DATE%3BGeoType%3ALHIN&$URLPARAMS2"
done


#http://mapper.kflaphi.ca/ilimapper/API/getSeasons
#http://mapper.kflaphi.ca/ilimapper/API/getCutoffs?flu_season=7&geo_type=Phu
#http://mapper.kflaphi.ca/ilimapper/API/getCutoffs?flu_season=7&geo_type=Lhin
#https://aces.kflaphi.ca/aces/ILIMapper/getPercentages?PHU=COHU
ln -s ../raw .
