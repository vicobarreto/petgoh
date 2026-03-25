// Data Models
export interface Partner {
    id: string;
    name: string;
    type: string;
    rating: number;
    location: string;
    image: string;
    priceLabel: string;
    priceValue: string;
    status?: 'pending' | 'approved' | 'rejected';
    website_url?: string;
    instagram_url?: string;
    hotel_photos?: string[];
}

export interface Pet {
    id: string;
    name: string;
    breed: string;
    age: string;
    gender: 'Macho' | 'Fêmea';
    weight: string;
    chipId: string;
    image: string;
    color: string; // For UI theme
}

export interface Package {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    images: string[];
    features: string[];
    partners: {
        name: string;
        role: string;
        badge?: string;
        details: string;
        icon: string;
    }[];
}

export interface AnatomyService {
    id: string;
    zone_id: string;
    package_id: string;
    package?: Package; // Joined package data
}

export interface AnatomyZone {
    id: string;
    name: string;
    description: string;
    symptoms: string[];
    x_pos: number;
    y_pos: number;
    icon: string;
    services?: AnatomyService[]; // Joined services
}

// Image Constants (Direct links from HTML provided)
export const IMAGES = {
    DOG_IN_BATH: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop",
    AVATAR_WOMAN: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBJ6II4EqYDBUf1KqwDu1B2XwyAQxv49tnXaedOX9HPnZw9eX1Fx_HCVgZLtPA4HK-dZXFSBu9XQwjJkV_EFcFIBWyFPzo2VJJadzG41EUYlO0VLK7YJ9eoT-tw3jFn1WLo7JyifUMceLfA9hYcpxWtZyTshdcLkxz-5HEFhXIE_BLae36M1GwlcldaLncpaj8705wTOmxRudtVovRVDYdsp3DEP-_s9_pYKXuVoqdLW4PRl60mW3xuxpL56EdV2k_4etIMcgPYZjp",
    AVATAR_MAN: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwGHL2FX9Ym4GtkLWrH9GL5I_qB_HWuN-kgLPoP9HIkaL_rRYby7mDh3soRa9PGaDIhCmxa2mFxv-WuhBFC_gIVoe8Ad9g4I8AQfvTGnlAcpWCjMIDd3Wb40xf6OlGi9isDGq9CBW_7idJkcNbfKx2jD3W75Tv97CvhTp1kGtKxwfYtgIObj6lG1Ps4TTMIcIMIL-chUR1lHBEAGPzEGMfZ28oehK0vBmovpVFxquRWwsSMM6BL0OrgLDVzZ3jES2bHOCs7l_H82V0",
    DOG_RUNNING: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi-oCZGjaO95jXh5zgtuR560qGaSMAWdjq823qFN5EH3hUluLgiybjsIzDA4F1p29U5esQ9ShUpg6NiKoFHyCTU9ViW0Ie48CbrW_qPCo64NcOwbyo19wg2w83gex5TP81F__uiWQBL6mkadUMoGaXGtXqaP7lHFK8_cCgq85D8S9zkaYg1no9c4ibVGt3X73kydR_5ksNiBBwE4FpYUhh7WJpPY9tQLw3Lx8Gd7Q-oc36VDUHCVg1fY1fwVrxs9qw6xJ3ltj7pVCt",
    DOG_BED: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCeSAHz8KXIyyvsNRCKtxBJ4RIJ7DYpgKksJOUm5Pm4J5wUg0edcWrpNbgMJ9vHkl3eHd8Zk_PNpCX8z5hndbnmYpO0Huap72jcRZePKn3MwvPFOBpS58XkLV05o8Xz_wpK7GF9zt5XrBhjJgqOE2HM_fgNTNJEVTNJ5Jt9SxiXQmwI6vUhtshrXlkeFMeUF5Vm2OcuctwRAbgRVpY9V5Vx7chuBAQ_ArzjZmzXUebgqA1ht3jTbd0U0VNagBljDfD9LWiipoiwXPg",
    DOG_CAR: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpMlof0GINagJ3zwPD6xNmys3RHM94PFD0f7x0O77mxFFhjwHgmh_mD6GHi_LM8YIK5voTOKYUAAtj5udn784jqca042R74JkrFM2x7tb2mXXQpWJzPfJK3hK4hP5F4oadLfS5Q2dZ2XlXvpvbVfUrTSNEza3D8b3DVMBbwUfPx-j3WMqZBSeBWNC5xI9AsQGsVnTcoqtHG28xDksB17GyQn4aUaZxcckczLM9vxRM4L-g7zkMvZvbP6KXQTD_OJhZ9LGBwnT-WmUT",
    TWO_DOGS: "https://lh3.googleusercontent.com/aida-public/AB6AXuBy5ZcEK60yGTmGg_i91v8NIcOK43gBAfvdklVqQPwhOaS1CLruPxn1-mOnu9TUMnRlLKMFUzyLjvO0YRa44WaC4sAFW4Ma5FmuqwAixKQTcCo50AT6cOWu_P4wQUpSDWlaS1u2W-yPvXSJutUXAhc4frrl13pnT6ssZAyPiN6dxfiJGPvCPSMBuckYqWtn41u924ofsGVNpchQgrZJT6LIdwyoBWORBIACl4swvFa1IGsaXV8wAC-bhr6COLumP60v4Wh00848JTht",
    HOTEL_INTERIOR: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4YE7NPTNv3fCoxLuUtu8GZ0X3kS70GkU6SS3yTCp3UyyiWaDvwTJ9C3G4iE7_57CFjYiDwckkdqmg3u66Ti5veOoLEV4iePztL4fVLfvjzPdmCQKTGWmrOYbZX-zxTXRD8ddJ0wLBRAcYsjnwNVvAeX82Mo7Cf8M03XqQ6h9JJx261c21lu9XK7mfPvqIpkemTHTtBInM5yjdatKJzoKWS5uS7vU2gJ_4RF4KB9MTgzz0NLFRGifcyhde5wArLDEUxy3grl2n8JW",
    VET_EXAM: "https://lh3.googleusercontent.com/aida-public/AB6AXuAotU4uixaarkqohVBUO_OYx9PEsom93ZGLf5F0wLb2ktLjR4HZk0LRJxDLAnx_WPLdKSUAUlpZ-mxvOl8Xfk3NK-2fSIBy6F-UsYuIJp2lzVbbiR56qssEiWLh725obMX06ZTh9MY9SCS4AlSyCTv3JGEcurMz5Lw_ac-UqdUJca3M34yA63ipOl780rNVOekRfE2JLRjT6l4kAC-mj_ujGZooN8rHn74Jp9IoBvU5TAMUPjnIYwPEphgXp45UiTRO1-l4idQFiUGs",
    DOG_DAYCARE: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIXoocdoc8AslYn27lxRrgeAfi62pJbBeSBzOa2lDu4WQYxStr7EXuCqOQROe71q3demtXh2EICagEFBycpy7l2Q9JYelHREXnp4eduTCr4uOWWUSx0Eid76WMkfnwa6GEhCyJmxxqvXUIAZhCNWmq-b5qJTjjy9QTngyZatSgcfkQKo3opd-YkE8MY_VPvEdfsGVQJ0GDWNkzFzO3H-zuxWLZkoXrToS2STjyvrp7ADUyRbYr-Z4aSATNP5R8zfGr8yhkm-kqz6Fx",
    DOG_WALKER: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMOcdKNButIjX2am16dvWkzF-5Zer-WmJvMQIPWtL0EcVV4GsVr9SppOWOhXO5xWvE1YixnhN31_iGsZjuaQlkz_jm3Pl-k___ygD_1JySsExa7U_bVq-QY3EYJDEcp30SAmNiZV8gRxUBn7xHK83qGq4mP1z5oE-DUj1PJ-DTZ-o_3X3g88TWTEKQ9o6rn6C6CS8U76AVwuCaNXY82qgJbqLR0zdDJeWPgG-1bqF-pNrJmvAedSJThJWBzeag3DcSHObjeWS0Hda2",
    PARTNER_LOGO: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk6T_ZMSNe1bU30FyrF5fOi3e0PbILmmoj6WRQfICnmzEaaJvM1al872SX6LEXImeRWpBqPOL8XLaoW4VugTWiPz5l5sMXXDprfkVoGC0E4gpnDMmXuXHcI7uVmVtleqdidLqegA78sJcEiDCXtHoU0OGwoek0NvtK4Gl22ZL_0kad__dESAy9r2SMnrqZY0iMDvtDdGBM_l6isLzwtvCCyzx8VNXVeDTlLni-U0FakDYEkMQVjSkw1pyXyE1kXqkKa3GCrbxWren7",
    QR_CODE: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcQ3pVyIZOKMtWNTH9iP4NnfPEY8EO5VAB3n9Y0qw1AEIJNeFic8201iZjzRo8DWsA6_PUrVKNs2pJsvB3dQJnZ3TbFO6W0ifFNr-voXTuW3zy5cAFaCJagEPzoS9TjG8U-D-3ILz2mBy3yoCEECA07zPv4tRucC5wiMlkSyWZoJkm1-KMpoxPEKPGQq3bWqRsBRMHPQY4irT3JW1z1maUWR4QAimOTX4EiDdi_XQixP2n2GymINe603pKBR4UjG_s-CqpgZ61dyp4",
    PACKAGE_HERO: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEOz73CcoqmdhdXbWW5MNlf05nR0IA4-V7plV_gZRtnD-AARLfTnEfcSCFmKF85NINxkxnOnybQStQ71z2wJBNAYJwG4Lj5-RBxRjOmj7ikTmbbhlf4EpkQMk3SeQ9MfP4WYOx2AZB3gE00k8HgKQWvWy5Cg9QLy19Gje46aC8gn3IeZNzphNrTgo-Gv9GjV4dNs8o8SBGNxxeeTsrz88PvCt-M3QIHCgVV2jtLe_ShFFbn3tasxbuoBZbUL1oIGg-6OnB9fy-YSr5",
    
    // Medical & Specialist Images
    DOCTOR_ANA: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBJ6II4EqYDBUf1KqwDu1B2XwyAQxv49tnXaedOX9HPnZw9eX1Fx_HCVgZLtPA4HK-dZXFSBu9XQwjJkV_EFcFIBWyFPzo2VJJadzG41EUYlO0VLK7YJ9eoT-tw3jFn1WLo7JyifUMceLfA9hYcpxWtZyTshdcLkxz-5HEFhXIE_BLae36M1GwlcldaLncpaj8705wTOmxRudtVovRVDYdsp3DEP-_s9_pYKXuVoqdLW4PRl60mW3xuxpL56EdV2k_4etIMcgPYZjp",
    DOCTOR_CARLOS: "https://lh3.googleusercontent.com/aida-public/AB6AXuAotU4uixaarkqohVBUO_OYx9PEsom93ZGLf5F0wLb2ktLjR4HZk0LRJxDLAnx_WPLdKSUAUlpZ-mxvOl8Xfk3NK-2fSIBy6F-UsYuIJp2lzVbbiR56qssEiWLh725obMX06ZTh9MY9SCS4AlSyCTv3JGEcurMz5Lw_ac-UqdUJca3M34yA63ipOl780rNVOekRfE2JLRjT6l4kAC-mj_ujGZooN8rHn74Jp9IoBvU5TAMUPjnIYwPEphgXp45UiTRO1-l4idQFiUGs",
    DOCTOR_JULIANA: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIXoocdoc8AslYn27lxRrgeAfi62pJbBeSBzOa2lDu4WQYxStr7EXuCqOQROe71q3demtXh2EICagEFBycpy7l2Q9JYelHREXnp4eduTCr4uOWWUSx0Eid76WMkfnwa6GEhCyJmxxqvXUIAZhCNWmq-b5qJTjjy9QTngyZatSgcfkQKo3opd-YkE8MY_VPvEdfsGVQJ0GDWNkzFzO3H-zuxWLZkoXrToS2STjyvrp7ADUyRbYr-Z4aSATNP5R8zfGr8yhkm-kqz6Fx",
    DOCTOR_ROBERTO: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMOcdKNButIjX2am16dvWkzF-5Zer-WmJvMQIPWtL0EcVV4GsVr9SppOWOhXO5xWvE1YixnhN31_iGsZjuaQlkz_jm3Pl-k___ygD_1JySsExa7U_bVq-QY3EYJDEcp30SAmNiZV8gRxUBn7xHK83qGq4mP1z5oE-DUj1PJ-DTZ-o_3X3g88TWTEKQ9o6rn6C6CS8U76AVwuCaNXY82qgJbqLR0zdDJeWPgG-1bqF-pNrJmvAedSJThJWBzeag3DcSHObjeWS0Hda2",
    
    // Specialists Top Rated
    DOC_RAFAEL: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiskPA3K476rmwQ_hQffB1dzrM5yC7VVDvf_LHozrgIRL-kMwEil2S44CzZa8MchFdTxK6jLK-9-Pth6Q5LVCdgCoXf99l4ckXxY32kTk0MrAVBTIHQmikrn3-bSvkLTkonvsNmBJoqpXwfXtAxJRT-pt-aLmMwPjBIDNEkkVYeGlPQOyZc6Z-5SYZ8o-uvAyWnYlLNxj_25Dz3tFQsafD_XNNqPwL9lzLb_UUkAwzwFofHdeMAZ0YvdWgsmKyUpxat3TGZJ4oFXCm",
    DOC_CAMILA: "https://lh3.googleusercontent.com/aida-public/AB6AXuAM86P8WNNfemDrD0gmyYyTyvsUMOtCleAefkczCQ9Gzl3hvqNMJhQOiJ7wdg95ppyNH18G0M7RLfe7SbFm-JCG7Ss3lotM8RYz8M4-fsUhn7Eh9-jZU-510lKG-6ulYFmvwh8Jcfa_6JQOPa9tkAwB_Y4LWj1N8kfJCmGnZE5XLImEMMULjVQwvutVN3jfzTJQYC5ofodBDBtsota4rzC0ew6Wexh00p5gGISukpc0DwYAkbzZT9bZddWj6wnh4PZBOGSG7WEgU0U6",
    DOC_PEDRO: "https://lh3.googleusercontent.com/aida-public/AB6AXuB76DwzRtwda0-hbmwIwTYV9OuZMNAxIhn4TcoG0eIyD3mOGirGfvkEs7vEutOmgJQojsW_yofKoNxfEYeKCH0SaY0PgkvPLR9Tv7vhxnlt8JOx0ZMSPY3Tl-znnW7_Y-o2QwRIIq5rZJXBvLz8YgMA6vrorUUWNbWIst0IiKlnh8hT4ot3bqrqIW4WoJ2dUM-i91OPfElGLUAgYNgc68TBG1bxXPgTjucjTx5X20LJRJ6-8roZzJsgib4TSj60Wb1JRebwAEY4ZgYT",
    DOC_MARIANA: "https://lh3.googleusercontent.com/aida-public/AB6AXuDt5uWHE3r1gDRn5MBqxjjJWvOptsMAcu9mfbP7cOUeT3yvsbZ6lUYHQaJIpqj3Gitk8PDXVHW7dPRv-aUxNY4Fgk1u-Uv2Sd0lBQpDFZza3iRvb5gaSk4sMbeVr15acuJgulKyvih7NbNTYihx3eNryylpYPKmDUn55J17bB-ETtlMFz_77Jv7px6Txai5C8W1AOrhbtweLJQY-OD97Bl1beJ_kYnrNoBaXei-AZ2vzEtCw4l3Lf2J6uvcECO-GI6yw_Z_Ndxrggfr",

    // Pet Wallet
    THOR_DOG: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp7qNn8SldJqa6Fdkuv_Bdv3kzCk9fZZ8PJU0SE0lLpIXrwSKNK5NrU0hk4jiO5sbEs2r-WBMjfje1aY5HQovygCVZEOBgDSjMk3HAbE_JLl_Ddlu0vZlz-E8yJWcpZNeBFsUwk-H7vGZ5of4PYlbzcTMtRe1hpOgu4EGCpamiHhesTjssRJTCuHF2EhJ3M6IDn0c3Nv0NOgDaPdB9jNGQKs-5peLV7x9yx-B9ZgBpHarn6FMzDeHfmo8wWqBNuzF_p8f_8yeivc0h",
    
    // Notifications Hero
    NOTIFICATIONS_HERO: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf-dAXzVzWfuhsK2S0QocQYX8OIyNkHb7Sw6-JHUWGGN8WlJYD8qSxnP2Ut2s_OZcmp8G2EGNFOWgxGmn9YnQJpB_2X54xGdCZ4pJEcNYu5et9kTafCUaC8KpyCzwt-0zvjyJcue-nFgX0ddkju0d6yJFxuFxG1cf3fo9OLO6MaUVvz3umvNuTjmBUFn-e05bpABgNbmyzxtKmNrpxc3XR30WaxXc-XsLQUSqpraLw6wWF-JoQBBtnMYS7e2w-TIeR8BThi13u0-m2",

    // Testimonials
    TESTIMONIAL_ANA: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEP6VOe8tpnIxLps8rcoeDqBBfveeuXEEGREpaxy0u86WMnxrvG8JgU2ExFmOK3tdVtoGSQW3RYdCYDu_QQgMLogRoiNlCIQQpkUc4bNYKsxSu2jc08LRWi_X2TgNrOahZn5rJWxunxt22Lh9ScidF0ENUpnaDTz5VA6pj10RB3hqMrrTdq1zE28ckr3hd_X6SIl7p6utGikv_Pgf_awwA-hXFxis6d-LaQTCO0OS2sY1h9DXC7LEZmUePrZ5VmSEIgFYAe_dRZwrP",
    TESTIMONIAL_CARLOS: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqngaQP7mCdnUubEV-TIOyVfHn2WDDXMsTZc6ciZRpYHnICMpViK4BPcNtuRAQK0mJFAOdTXG8XoBTitakot6X2VgAgWZ3yGQilnbUHEWGyOfwJC9zmKM3FSUh_N0E1vDgTK3PQWqmje6m33SOOTm2w-kX8fvz9WTElqX3M7rwljqxp359q26XiQ716xzz5flTIglrdnf8-93ISJJqPPvWHrys18Ct4QnoXxzqLKpfUcjtOdbuW6j81A3C_H6OqRja1C1pT9QXbj4y",
    TESTIMONIAL_MARIANA: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFNfq7GmkloNW1zQ4WEopB0KRkgkuN3_NT6B3kdQnmYSYf76981hL8sX9PXwI3w2sNDY45kZw10Lu3k4rLFqpiLUD_325rUOMmKFBPLrU7VipkjxVtP9nCeVbgp8QaVmwNUunOCbDmsWOvbASDwQhrGRAk4v6DqhcHe2J1NfbRtC5EpyerZYK7Zw7SoF41rp6gXWeWNKfhpfrIQlydbVXkjZQR77TpAZrNrgpthuGozCBFpmF4L9jdjm8yqFPNw7V__nGtg9tJONYO"
};