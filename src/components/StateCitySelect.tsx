import React from "react";
import { State, City } from "country-state-city";
import { MenuItem, TextField, Box } from "@mui/material";

interface Props {
    stateValue: string;
    cityValue: string;
    onStateChange: (stateCode: string) => void;
    onCityChange: (city: string) => void;
}

const StateCitySelect: React.FC<Props> = ({
    stateValue,
    cityValue,
    onStateChange,
    onCityChange,
}) => {
    const states = State.getStatesOfCountry("IN");
    const cities = stateValue ? City.getCitiesOfState("IN", stateValue) : [];

    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            {/* STATE SELECT - Compact */}
            <TextField
                select
                label="State"
                size="small"
                value={stateValue}
                onChange={(e) => onStateChange(e.target.value)}
                sx={{
                    minWidth: 140,
                    flex: 1,
                    "& .MuiOutlinedInput-root": { height: "40px" },
                    "& .MuiInputLabel-root": { fontSize: "14px" },
                    "& .MuiSelect-select": {
                        padding: "8px 12px",
                        fontSize: "14px",
                    },
                }}
                slotProps={{
                    select: {
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    backgroundColor: "#1A0B2E",
                                    backdropFilter: "none",
                                    "& .MuiMenuItem-root": {
                                        backgroundColor: "#1A0B2E",
                                        "&:hover": {
                                            backgroundColor: "#2D1B69",
                                        },
                                    },
                                },
                            },
                        },
                    },
                }}
            >
                <MenuItem value="" sx={{ fontSize: "14px" }}>
                    Select State
                </MenuItem>
                {states.map((st) => (
                    <MenuItem
                        key={st.isoCode}
                        value={st.isoCode}
                        sx={{ fontSize: "14px", py: 0 }}
                    >
                        {st.name}
                    </MenuItem>
                ))}
            </TextField>

            {/* CITY SELECT - Compact */}
            <TextField
                select
                label="City"
                size="small"
                disabled={!stateValue}
                value={cityValue}
                onChange={(e) => onCityChange(e.target.value)}
                sx={{
                    minWidth: 140,
                    flex: 1,
                    "& .MuiOutlinedInput-root": { height: "40px" },
                    "& .MuiInputLabel-root": { fontSize: "14px" },
                    "& .MuiSelect-select": {
                        padding: "8px 12px",
                        fontSize: "14px",
                    },
                }}
                slotProps={{
                    select: {
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    backgroundColor: "#1A0B2E",
                                    backdropFilter: "none",
                                    "& .MuiMenuItem-root": {
                                        backgroundColor: "#1A0B2E",
                                        "&:hover": {
                                            backgroundColor: "#2D1B69",
                                        },
                                    },
                                },
                            },
                        },
                    },
                }}
            >
                <MenuItem value="" sx={{ fontSize: "14px" }}>
                    Select City
                </MenuItem>
                {cities.map((city, idx) => (
                    <MenuItem
                        key={idx}
                        value={city.name}
                        sx={{ fontSize: "14px", py: 0 }}
                    >
                        {city.name}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};

export default StateCitySelect;
