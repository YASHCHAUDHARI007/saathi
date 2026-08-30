from rest_framework import serializers

class DistrictMetricSerializer(serializers.Serializer):
    districtName = serializers.CharField()
    stateName = serializers.CharField()
    activeCases = serializers.IntegerField()
    highDistressCount = serializers.IntegerField()
    avgDistressScore = serializers.IntegerField()
    criticalAlerts = serializers.IntegerField()
    counsellorRatio = serializers.CharField()
    responseRate = serializers.IntegerField()
    interventionsCompleted = serializers.IntegerField()
    geoCoordinates = serializers.DictField()


class StateMetricSerializer(serializers.Serializer):
    stateName = serializers.CharField()
    stateCode = serializers.CharField()
    totalCases = serializers.IntegerField()
    activeDistricts = serializers.IntegerField()
    stateAvgDistress = serializers.IntegerField()
    criticalAlerts = serializers.IntegerField()
    dlsaCoverage = serializers.FloatField()
    policeResponseTimeHours = serializers.FloatField()
    convictionRatePct = serializers.FloatField()
    monetaryReliefDisbursedLakhs = serializers.FloatField()


class NationalOverviewSerializer(serializers.Serializer):
    totalCasesMonitored = serializers.IntegerField()
    highVulnerabilityCases = serializers.IntegerField()
    activeUnresolvedAlerts = serializers.IntegerField()
    interventionsCompleted = serializers.IntegerField()
    avgNationalDistressIndex = serializers.IntegerField()
    participatingStates = serializers.IntegerField()
    participatingDistricts = serializers.IntegerField()
    cctnsSyncStatus = serializers.CharField()
    eCourtsSyncStatus = serializers.CharField()
    dlsaSyncStatus = serializers.CharField()
