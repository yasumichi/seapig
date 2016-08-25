#!/bin/sh

VERSION=`grep version package.json | sed -e 's/.*"version": "//' -e 's/",//'`
LOGFILE=${HOME}/seapig_build.log

# clean directory releases
echo -e "\e[32m[clean]\e[m old releases"
rm -rf releases > ${LOGFILE} 2>&1

# install node_modules
echo -e "\e[32m[install]\e[m dependencies node modules"
npm install --global-style >> ${LOGFILE} 2>&1

# make packages
for PLATFORM in darwin win32 linux
do
	echo -e "\e[32m[package]\e[m ${PLATFORM}"
	npm run-script package:${PLATFORM} >> ${LOGFILE} 2>&1
done

# archive packages
cd releases
for DIR in seapig-*
do
	ZIP_FILE=${DIR}-${VERSION}.zip
	echo -e "\e[32m[archive]\e[m `pwd`/${ZIP_FILE}"
	zip -r ${ZIP_FILE} ${DIR} >> ${LOGFILE} 2>&1
done

# complete message
echo
echo -e "When problems is happened, see \e[31m${LOGFILE}\e[m"
