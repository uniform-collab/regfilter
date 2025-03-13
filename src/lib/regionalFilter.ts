const provinceToIdMapping: Record<string, string> = {
  AB: '48B0SBB8XAoYqyI86RmJu5',
  BC: '2J3clHfSsgLCSullBNWPfw',
  MB: '8c7hGY0ZMBXYfT8P3jx2Q',
  NB: '5BL38cOdzw6VoRLxA8EKhm',
  NL: '2SGKDDEFGOhbusLKXv1aOA',
  NS: '5wnF7tYCfu1uAJ3bHYGEn4',
  ON: '5VxvzCjA1lbfcbpaD9WXkE',
  PE: '4TkS9UlJLmsuQxtI2pBqBQ',
  QC: '5iBKdR2Wg4LQNfBpULUEmR',
  SK: '4sIOwJV0OaE4U9IhHxYMru',
  NT: '5jyq3QypE3nkmgEPCApiAH',
  NU: '4D7oUpGP2lly0f25hG2Upk',
  YT: '5RTWtyfMo807YlUq6KQjwt',
};

export function filterByProvince<T>(
  data: T,
  officialAbbreviation: string | undefined,
  removeProvince?: boolean
): T | null {

  const targetConceptId = officialAbbreviation ? provinceToIdMapping[officialAbbreviation] : null;

  // Helper function to check if an item has a default audience
  const hasDefaultAudience = (item: any): boolean => {
    // If item has no audiences field, consider it as default
    if (!item?.fields?.audiences) {
      return true;
    }
    const audiences = item.fields.audiences;
    return audiences.some((audience: any) => audience?.fields?.default === true);
  };

  // Helper function to check if an item matches the target province
  const matchesProvince = (item: any): boolean => {
    const audiences = item?.fields?.audiences || [];
    return audiences.some((audience: any) => {
      const concepts = audience?.metadata?.concepts || [];
      return concepts.some((concept: any) => concept?.sys?.id === targetConceptId);
    });
  };

  // Helper function to filter content arrays
  const filterContentArray = (arr: any[]): any[] => {
    if (officialAbbreviation) {
      // If province specified, keep items that match province
      const provinceMatches = arr.filter(matchesProvince);
      if (provinceMatches.length > 0) {
        return provinceMatches.map((item) => {
          const filtered = { ...item };
          // Recursively filter nested content
          if (filtered.fields?.content) {
            filtered.fields.content = filterByProvince(
              filtered.fields.content,
              officialAbbreviation,
              removeProvince
            );
          }
          if (filtered.fields?.listItem) {
            filtered.fields.listItem = filterByProvince(
              filtered.fields.listItem,
              officialAbbreviation,
              removeProvince
            );
          }
          return filtered;
        });
      }
    }

    // If no province specified or no province matches, keep only default items
    const defaultItems = arr.filter(hasDefaultAudience);
    if (defaultItems.length > 0) {
      return defaultItems.map((item) => {
        const filtered = { ...item };
        // Recursively filter nested content
        if (filtered.fields?.content) {
          filtered.fields.content = filterByProvince(
            filtered.fields.content,
            officialAbbreviation,
            removeProvince
          );
        }
        if (filtered.fields?.listItem) {
          filtered.fields.listItem = filterByProvince(
            filtered.fields.listItem,
            officialAbbreviation,
            removeProvince
          );
        }
        return filtered;
      });
    }

    return [];
  };

  // 1) Handle arrays
  if (Array.isArray(data)) {
    // Check if this is a content array by looking for audiences or content fields
    const isContentArray =
      data.length > 0 &&
      (data[0]?.fields?.audiences !== undefined ||
        data[0]?.fields?.content !== undefined ||
        data[0]?.fields?.listItem !== undefined);

    if (isContentArray) {
      return filterContentArray(data) as T;
    }

    // For other arrays, process each item
    const filteredArray = data
      .map((item) => filterByProvince(item, officialAbbreviation, removeProvince))
      .filter((item) => item !== null);
    return filteredArray as T;
  }

  // 2) Handle objects
  if (data && typeof data === 'object') {
    const typedData = data as Record<string, any>;

    // If this object has audiences, check if it should be included
    if (typedData.fields?.audiences) {
      if (officialAbbreviation) {
        if (!matchesProvince(typedData)) {
          return null;
        }
      } else if (!hasDefaultAudience(typedData)) {
        return null;
      }
    }

    const clone = { ...typedData };

    // Process nested fields
    for (const key of Object.keys(clone)) {
      if (key === 'content' || key === 'listItem') {
        clone[key] = filterByProvince(clone[key], officialAbbreviation, removeProvince);
      } else {
        const value = filterByProvince(clone[key], officialAbbreviation, removeProvince);
        if (value === null) {
          delete clone[key];
        } else {
          clone[key] = value;
        }
      }
    }

    // Remove sys and metadata
    delete clone.sys;
    delete clone.metadata;

    return clone as T;
  }

  // 3) Return primitives as-is
  return data;
}