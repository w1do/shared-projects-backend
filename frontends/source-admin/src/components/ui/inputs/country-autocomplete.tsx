"use client";

import ReactCountryFlag from "react-country-flag";
import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteProps,
} from "@/components/ui/inputs/autocomplete";

const countryIsoMap: Record<string, string> = {
  "south korea": "KR",
  korea: "KR",
  france: "FR",
  japan: "JP",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  us: "US",
  italy: "IT",
  switzerland: "CH",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  germany: "DE",
  australia: "AU",
  spain: "ES",
  canada: "CA",
  vietnam: "VN",
  china: "CN",
  singapore: "SG",
  thailand: "TH",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  netherlands: "NL",
  belgium: "BE",
  "new zealand": "NZ",
};

interface CountryAutocompleteProps extends Omit<
  AutocompleteProps,
  "options" | "renderOption" | "renderValue"
> {
  countries: string[];
}

export function getCountryIso(country: string): string | undefined {
  return countryIsoMap[country.toLowerCase().trim()];
}

export function CountryAutocomplete({ countries, ...props }: CountryAutocompleteProps) {
  const options = countries.map<AutocompleteOption>((country) => ({
    label: country,
    value: country,
  }));

  return (
    <Autocomplete
      {...props}
      options={options}
      allowCustomValue
      searchPlaceholder="Search or type custom country..."
      customValueLabel={(value) => `Use "${value}"`}
      renderOption={(option) => <CountryOptionLabel country={option.value} />}
      renderValue={(option) => <CountryOptionLabel country={option.value} />}
    />
  );
}

function CountryOptionLabel({ country }: { country: string }) {
  const countryIso = getCountryIso(country);

  return (
    <>
      {countryIso && (
        <ReactCountryFlag
          countryCode={countryIso}
          svg
          className="admin-country-flag"
          aria-label={country}
        />
      )}
      <span className="truncate">{country}</span>
    </>
  );
}
