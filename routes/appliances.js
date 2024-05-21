const express = require('express');
const applianceRouter = express.Router();
const fs = require('fs');
const path = require('path');

// Global variable to store Appliances data
let allAppliances = [];

// Global variable to store AppliancesInfo data
let appliancesInfo = [];

// Read Appliances JSON file and store in global variable
fs.readFile(path.join(__dirname, '../mockData/appliances.json'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading appliances JSON file:', err);
        return;
    }
    allAppliances = JSON.parse(data);
    console.log('Appliances JSON data loaded successfully');
});

// Read AppliancesInfo JSON file and store in global variable
fs.readFile(path.join(__dirname, '../mockData/appliancesInfo.json'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading appliancesInfo JSON file:', err);
        return;
    }
    appliancesInfo = JSON.parse(data);
    console.log('Appliance Info JSON data loaded successfully');
});

const getDownloadStatusCount = (deviceReports) => {
    const groupedReports = Object.groupBy(deviceReports, report => report.downloadStatus);
    const countByDownloadStatus = Object.keys(groupedReports).reduce((acc, cur) => {
        acc[cur] = groupedReports[cur].length;
        return acc;
    }, {});
    return countByDownloadStatus;
}

applianceRouter.get('/appliances', (req, res) => {
    const { 
        offset = 0, 
        fetchCount = 10,
        searchString,
        deviceStatus, 
        downloadStatus 
    } = req.query;
    let filteredAppliances = allAppliances;
    const downloadStatusCount = getDownloadStatusCount(filteredAppliances);

    if (deviceStatus) {
        filteredAppliances = filteredAppliances.filter(appliance => appliance.deviceStatus.toLowerCase() === deviceStatus.toLowerCase());
    }

    if (downloadStatus) {
        filteredAppliances = filteredAppliances.filter(appliance => appliance.downloadStatus.toLowerCase() === downloadStatus.toLowerCase());
    }

    if (searchString) {
        filteredAppliances = filteredAppliances.filter(appliance => appliance.serialNo.includes(searchString));
    }

    const totalCount = filteredAppliances.length;

    // Sort the filtered list by serialNo
    const sortedAppliances = filteredAppliances.sort((a, b) => a.serialNo.localeCompare(b.serialNo));

    // Paginate the sorted list
    const paginatedAppliances = sortedAppliances.slice(offset, offset + fetchCount);

    res.status(200).json({
        appliances: paginatedAppliances,
        totalCount,
        downloadStatusCount
    })
});

applianceRouter.get('/appliance/:applianceId/info', (req, res) => {
    const { applianceId } = req.params;
    const applianceInfo = appliancesInfo.find(appliance => appliance.serialNo?.toLowerCase() === applianceId?.toLowerCase());
    if (applianceInfo) {
        res.status(200).json(applianceInfo);
    } else {
        res.status(404).json({
            type: 404,
            httpCode: "404 Not Found",
            requestId: applianceId,
            error: {
                code: "APPLIANCE_NOT_FOUND",
                message: "Appliance not found"
            }
        })
    }
});

module.exports = {
    applianceRouter
}