import { useMemo } from "react";
import { type SourceFilterState } from "~/components/SourceFilterInterface";
import { type VulnTableDataWithSources } from "~/components/VulnerabilityTableSourceColumns";
import { confidenceFilterOptions } from "~/components/VulnerabilityTableSourceColumns";

export const useSourceFiltering = (
  data: VulnTableDataWithSources[],
  filters: SourceFilterState
) => {
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((vulnerability) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          vulnerability.cve.toLowerCase().includes(searchLower) ||
          vulnerability.description.toLowerCase().includes(searchLower) ||
          vulnerability.severity.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Source filter
      if (filters.sources.length > 0) {
        const hasMatchingSource = vulnerability.sources?.some((source) =>
          filters.sources.includes(source.source)
        );
        if (!hasMatchingSource) return false;
      }

      // Confidence filter
      if (filters.confidence.length > 0) {
        if (!vulnerability.sources || vulnerability.sources.length === 0) {
          return false;
        }

        const avgConfidence =
          vulnerability.sources.reduce(
            (sum, source) => sum + source.confidence,
            0
          ) / vulnerability.sources.length;

        const matchesConfidence = filters.confidence.some((confidenceLevel) => {
          const option = confidenceFilterOptions.find(
            (opt) => opt.value === confidenceLevel
          );
          if (!option) return false;
          return avgConfidence >= option.min && avgConfidence <= option.max;
        });

        if (!matchesConfidence) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        if (!vulnerability.sources || vulnerability.sources.length === 0) {
          return false;
        }

        // Get the earliest first_seen date from all sources
        const earliestDate = vulnerability.sources.reduce(
          (earliest, source) => {
            const sourceDate = new Date(source.first_seen);
            return sourceDate < earliest ? sourceDate : earliest;
          },
          new Date(vulnerability.sources[0].first_seen)
        );

        // Get the latest last_seen date from all sources
        const latestDate = vulnerability.sources.reduce((latest, source) => {
          const sourceDate = new Date(source.last_seen);
          return sourceDate > latest ? sourceDate : latest;
        }, new Date(vulnerability.sources[0].last_seen));

        // Check if the vulnerability's date range overlaps with the filter range
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (latestDate < startDate) return false;
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          if (earliestDate > endDate) return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Calculate filter statistics
  const filterStats = useMemo(() => {
    const total = data?.length || 0;
    const filtered = filteredData.length;
    const hidden = total - filtered;

    // Source distribution in filtered results
    const sourceDistribution: Record<string, number> = {};
    filteredData.forEach((vuln) => {
      vuln.sources?.forEach((source) => {
        sourceDistribution[source.source] =
          (sourceDistribution[source.source] || 0) + 1;
      });
    });

    // Severity distribution in filtered results
    const severityDistribution: Record<string, number> = {};
    filteredData.forEach((vuln) => {
      severityDistribution[vuln.severity] =
        (severityDistribution[vuln.severity] || 0) + 1;
    });

    // Confidence distribution in filtered results
    const confidenceDistribution = {
      high: 0,
      medium: 0,
      low: 0,
    };

    filteredData.forEach((vuln) => {
      if (vuln.sources && vuln.sources.length > 0) {
        const avgConfidence =
          vuln.sources.reduce((sum, source) => sum + source.confidence, 0) /
          vuln.sources.length;

        if (avgConfidence >= 0.9) confidenceDistribution.high++;
        else if (avgConfidence >= 0.7) confidenceDistribution.medium++;
        else confidenceDistribution.low++;
      }
    });

    return {
      total,
      filtered,
      hidden,
      sourceDistribution,
      severityDistribution,
      confidenceDistribution,
    };
  }, [data, filteredData]);

  return {
    filteredData,
    filterStats,
  };
};

// Helper function to apply table-level filtering (for react-table integration)
export const createSourceFilterFn = (filters: SourceFilterState) => {
  return (row: any, columnId: string, filterValue: any) => {
    const vulnerability = row.original as VulnTableDataWithSources;

    // This function is called by react-table for each filter
    // We'll handle the main filtering in the hook above
    // This is mainly for column-specific filters

    if (columnId === "sources" && filterValue && filterValue.length > 0) {
      return (
        vulnerability.sources?.some((source) =>
          filterValue.includes(source.source)
        ) || false
      );
    }

    if (columnId === "severity" && filterValue && filterValue.length > 0) {
      return filterValue.includes(vulnerability.severity);
    }

    if (columnId === "confidence_score" && filterValue) {
      if (!vulnerability.sources || vulnerability.sources.length === 0) {
        return false;
      }

      const avgConfidence =
        vulnerability.sources.reduce(
          (sum, source) => sum + source.confidence,
          0
        ) / vulnerability.sources.length;

      return (
        avgConfidence >= filterValue.min && avgConfidence <= filterValue.max
      );
    }

    return true;
  };
};

export default useSourceFiltering;
