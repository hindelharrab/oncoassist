package com.oncoassist.oncoassist.model.entity.enums;

public enum BIRADSEnum {

    BIRADS_0("BI-RADS 0"),
    BIRADS_1("BI-RADS 1"),
    BIRADS_2("BI-RADS 2"),
    BIRADS_3("BI-RADS 3"),
    BIRADS_4A("BI-RADS 4A"),
    BIRADS_4B("BI-RADS 4B"),
    BIRADS_4C("BI-RADS 4C"),
    BIRADS_5("BI-RADS 5"),
    BIRADS_6("BI-RADS 6");

    private final String label;

    BIRADSEnum(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // Convertit "BI-RADS 4B" → BIRADS_4B automatiquement
    public static BIRADSEnum fromLabel(String label) {
        if (label == null) return null;
        for (BIRADSEnum b : values()) {
            if (b.label.equalsIgnoreCase(label.trim())) {
                return b;
            }
        }
        return null;
    }
}