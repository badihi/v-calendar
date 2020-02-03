/* eslint-disable */
/*
            JavaScript functions for positional astronomy

                  by John Walker  --  September, MIM
                       http://www.fourmilab.ch/

                This program is in the public domain.
*/

//  Frequently-used constants

var
    J2000 = 2451545.0, // Julian day of J2000 epoch
    JulianCentury = 36525.0, // Days in Julian century
    JulianMillennium = (JulianCentury * 10), // Days in Julian millennium
    AstronomicalUnit = 149597870.0, // Astronomical unit in kilometres
    TropicalYear = 365.24219878; // Mean solar tropical year

/*  ASTOR  --  Arc-seconds to radians.  */

function astor(a) {
    return a * (Math.PI / (180.0 * 3600.0));
}

/*  DTR  --  Degrees to radians.  */

function dtr(d) {
    return (d * Math.PI) / 180.0;
}

/*  RTD  --  Radians to degrees.  */

function rtd(r) {
    return (r * 180.0) / Math.PI;
}

/*  FIXANGLE  --  Range reduce angle in degrees.  */

function fixangle(a) {
    return a - 360.0 * (Math.floor(a / 360.0));
}

/*  FIXANGR  --  Range reduce angle in radians.  */

function fixangr(a) {
    return a - (2 * Math.PI) * (Math.floor(a / (2 * Math.PI)));
}

//  DSIN  --  Sine of an angle in degrees

function dsin(d) {
    return Math.sin(dtr(d));
}

//  DCOS  --  Cosine of an angle in degrees

function dcos(d) {
    return Math.cos(dtr(d));
}

/*  MOD  --  Modulus function which works for non-integers.  */

function mod(a, b) {
    return a - (b * Math.floor(a / b));
}

//  AMOD  --  Modulus function which returns numerator if modulus is zero

function amod(a, b) {
    return mod(a - 1, b) + 1;
}

/*  JHMS  --  Convert Julian time to hour, minutes, and seconds,
              returned as a three-element array.  */

function jhms(j) {
    var ij;

    j += 0.5; /* Astronomical to civil */
    ij = ((j - Math.floor(j)) * 86400.0) + 0.5;
    return new Array(
        Math.floor(ij / 3600),
        Math.floor((ij / 60) % 60),
        Math.floor(ij % 60));
}

//  JWDAY  --  Calculate day of week from Julian day

var Weekdays = new Array("Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday");

function jwday(j) {
    return mod(Math.floor((j + 1.5)), 7);
}

/*  OBLIQEQ  --  Calculate the obliquity of the ecliptic for a given
                 Julian date.  This uses Laskar's tenth-degree
                 polynomial fit (J. Laskar, Astronomy and
                 Astrophysics, Vol. 157, page 68 [1986]) which is
                 accurate to within 0.01 arc second between AD 1000
                 and AD 3000, and within a few seconds of arc for
                 +/-10000 years around AD 2000.  If we're outside the
                 range in which this fit is valid (deep time) we
                 simply return the J2000 value of the obliquity, which
                 happens to be almost precisely the mean.  */

var oterms = new Array(-4680.93, -1.55,
    1999.25, -51.38, -249.67, -39.05,
    7.12,
    27.87,
    5.79,
    2.45
);

function obliqeq(jd) {
    var eps, u, v, i;

    v = u = (jd - J2000) / (JulianCentury * 100);

    eps = 23 + (26 / 60.0) + (21.448 / 3600.0);

    if (Math.abs(u) < 1.0) {
        for (i = 0; i < 10; i++) {
            eps += (oterms[i] / 3600.0) * v;
            v *= u;
        }
    }
    return eps;
}

/* Periodic terms for nutation in longiude (delta \Psi) and
   obliquity (delta \Epsilon) as given in table 21.A of
   Meeus, "Astronomical Algorithms", first edition. */

var nutArgMult = new Array(
    0, 0, 0, 0, 1, -2, 0, 0, 2, 2,
    0, 0, 0, 2, 2,
    0, 0, 0, 0, 2,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0, -2, 1, 0, 2, 2,
    0, 0, 0, 2, 1,
    0, 0, 1, 2, 2, -2, -1, 0, 2, 2, -2, 0, 1, 0, 0, -2, 0, 0, 2, 1,
    0, 0, -1, 2, 2,
    2, 0, 0, 0, 0,
    0, 0, 1, 0, 1,
    2, 0, -1, 2, 2,
    0, 0, -1, 0, 1,
    0, 0, 1, 2, 1, -2, 0, 2, 0, 0,
    0, 0, -2, 2, 1,
    2, 0, 0, 2, 2,
    0, 0, 2, 2, 2,
    0, 0, 2, 0, 0, -2, 0, 1, 2, 2,
    0, 0, 0, 2, 0, -2, 0, 0, 2, 0,
    0, 0, -1, 2, 1,
    0, 2, 0, 0, 0,
    2, 0, -1, 0, 1, -2, 2, 0, 2, 2,
    0, 1, 0, 0, 1, -2, 0, 1, 0, 1,
    0, -1, 0, 0, 1,
    0, 0, 2, -2, 0,
    2, 0, -1, 2, 1,
    2, 0, 1, 2, 2,
    0, 1, 0, 2, 2, -2, 1, 1, 0, 0,
    0, -1, 0, 2, 2,
    2, 0, 0, 2, 1,
    2, 0, 1, 0, 0, -2, 0, 2, 2, 2, -2, 0, 1, 2, 1,
    2, 0, -2, 0, 1,
    2, 0, 0, 0, 1,
    0, -1, 1, 0, 0, -2, -1, 0, 2, 1, -2, 0, 0, 0, 1,
    0, 0, 2, 2, 1, -2, 0, 2, 0, 1, -2, 1, 0, 2, 1,
    0, 0, 1, -2, 0, -1, 0, 1, 0, 0, -2, 1, 0, 0, 0,
    1, 0, 0, 0, 0,
    0, 0, 1, 2, 0, -1, -1, 1, 0, 0,
    0, 1, 1, 0, 0,
    0, -1, 1, 2, 2,
    2, -1, -1, 2, 2,
    0, 0, -2, 2, 2,
    0, 0, 3, 2, 2,
    2, -1, 0, 2, 2
);

var nutArgCoeff = new Array(-171996, -1742, 92095, 89, /*  0,  0,  0,  0,  1 */ -13187, -16, 5736, -31, /* -2,  0,  0,  2,  2 */ -2274, -2, 977, -5, /*  0,  0,  0,  2,  2 */
    2062, 2, -895, 5, /*  0,  0,  0,  0,  2 */
    1426, -34, 54, -1, /*  0,  1,  0,  0,  0 */
    712, 1, -7, 0, /*  0,  0,  1,  0,  0 */ -517, 12, 224, -6, /* -2,  1,  0,  2,  2 */ -386, -4, 200, 0, /*  0,  0,  0,  2,  1 */ -301, 0, 129, -1, /*  0,  0,  1,  2,  2 */
    217, -5, -95, 3, /* -2, -1,  0,  2,  2 */ -158, 0, 0, 0, /* -2,  0,  1,  0,  0 */
    129, 1, -70, 0, /* -2,  0,  0,  2,  1 */
    123, 0, -53, 0, /*  0,  0, -1,  2,  2 */
    63, 0, 0, 0, /*  2,  0,  0,  0,  0 */
    63, 1, -33, 0, /*  0,  0,  1,  0,  1 */ -59, 0, 26, 0, /*  2,  0, -1,  2,  2 */ -58, -1, 32, 0, /*  0,  0, -1,  0,  1 */ -51, 0, 27, 0, /*  0,  0,  1,  2,  1 */
    48, 0, 0, 0, /* -2,  0,  2,  0,  0 */
    46, 0, -24, 0, /*  0,  0, -2,  2,  1 */ -38, 0, 16, 0, /*  2,  0,  0,  2,  2 */ -31, 0, 13, 0, /*  0,  0,  2,  2,  2 */
    29, 0, 0, 0, /*  0,  0,  2,  0,  0 */
    29, 0, -12, 0, /* -2,  0,  1,  2,  2 */
    26, 0, 0, 0, /*  0,  0,  0,  2,  0 */ -22, 0, 0, 0, /* -2,  0,  0,  2,  0 */
    21, 0, -10, 0, /*  0,  0, -1,  2,  1 */
    17, -1, 0, 0, /*  0,  2,  0,  0,  0 */
    16, 0, -8, 0, /*  2,  0, -1,  0,  1 */ -16, 1, 7, 0, /* -2,  2,  0,  2,  2 */ -15, 0, 9, 0, /*  0,  1,  0,  0,  1 */ -13, 0, 7, 0, /* -2,  0,  1,  0,  1 */ -12, 0, 6, 0, /*  0, -1,  0,  0,  1 */
    11, 0, 0, 0, /*  0,  0,  2, -2,  0 */ -10, 0, 5, 0, /*  2,  0, -1,  2,  1 */ -8, 0, 3, 0, /*  2,  0,  1,  2,  2 */
    7, 0, -3, 0, /*  0,  1,  0,  2,  2 */ -7, 0, 0, 0, /* -2,  1,  1,  0,  0 */ -7, 0, 3, 0, /*  0, -1,  0,  2,  2 */ -7, 0, 3, 0, /*  2,  0,  0,  2,  1 */
    6, 0, 0, 0, /*  2,  0,  1,  0,  0 */
    6, 0, -3, 0, /* -2,  0,  2,  2,  2 */
    6, 0, -3, 0, /* -2,  0,  1,  2,  1 */ -6, 0, 3, 0, /*  2,  0, -2,  0,  1 */ -6, 0, 3, 0, /*  2,  0,  0,  0,  1 */
    5, 0, 0, 0, /*  0, -1,  1,  0,  0 */ -5, 0, 3, 0, /* -2, -1,  0,  2,  1 */ -5, 0, 3, 0, /* -2,  0,  0,  0,  1 */ -5, 0, 3, 0, /*  0,  0,  2,  2,  1 */
    4, 0, 0, 0, /* -2,  0,  2,  0,  1 */
    4, 0, 0, 0, /* -2,  1,  0,  2,  1 */
    4, 0, 0, 0, /*  0,  0,  1, -2,  0 */ -4, 0, 0, 0, /* -1,  0,  1,  0,  0 */ -4, 0, 0, 0, /* -2,  1,  0,  0,  0 */ -4, 0, 0, 0, /*  1,  0,  0,  0,  0 */
    3, 0, 0, 0, /*  0,  0,  1,  2,  0 */ -3, 0, 0, 0, /* -1, -1,  1,  0,  0 */ -3, 0, 0, 0, /*  0,  1,  1,  0,  0 */ -3, 0, 0, 0, /*  0, -1,  1,  2,  2 */ -3, 0, 0, 0, /*  2, -1, -1,  2,  2 */ -3, 0, 0, 0, /*  0,  0, -2,  2,  2 */ -3, 0, 0, 0, /*  0,  0,  3,  2,  2 */ -3, 0, 0, 0 /*  2, -1,  0,  2,  2 */
);

/*  NUTATION  --  Calculate the nutation in longitude, deltaPsi, and
                  obliquity, deltaEpsilon for a given Julian date
                  jd.  Results are returned as a two element Array
                  giving (deltaPsi, deltaEpsilon) in degrees.  */

function nutation(jd) {
    var deltaPsi, deltaEpsilon,
        i, j,
        t = (jd - 2451545.0) / 36525.0,
        t2, t3, to10,
        ta = new Array,
        dp = 0,
        de = 0,
        ang;

    t3 = t * (t2 = t * t);

    /* Calculate angles.  The correspondence between the elements
       of our array and the terms cited in Meeus are:

       ta[0] = D  ta[0] = M  ta[2] = M'  ta[3] = F  ta[4] = \Omega

    */

    ta[0] = dtr(297.850363 + 445267.11148 * t - 0.0019142 * t2 +
        t3 / 189474.0);
    ta[1] = dtr(357.52772 + 35999.05034 * t - 0.0001603 * t2 -
        t3 / 300000.0);
    ta[2] = dtr(134.96298 + 477198.867398 * t + 0.0086972 * t2 +
        t3 / 56250.0);
    ta[3] = dtr(93.27191 + 483202.017538 * t - 0.0036825 * t2 +
        t3 / 327270);
    ta[4] = dtr(125.04452 - 1934.136261 * t + 0.0020708 * t2 +
        t3 / 450000.0);

    /* Range reduce the angles in case the sine and cosine functions
       don't do it as accurately or quickly. */

    for (i = 0; i < 5; i++) {
        ta[i] = fixangr(ta[i]);
    }

    to10 = t / 10.0;
    for (i = 0; i < 63; i++) {
        ang = 0;
        for (j = 0; j < 5; j++) {
            if (nutArgMult[(i * 5) + j] != 0) {
                ang += nutArgMult[(i * 5) + j] * ta[j];
            }
        }
        dp += (nutArgCoeff[(i * 4) + 0] + nutArgCoeff[(i * 4) + 1] * to10) * Math.sin(ang);
        de += (nutArgCoeff[(i * 4) + 2] + nutArgCoeff[(i * 4) + 3] * to10) * Math.cos(ang);
    }

    /* Return the result, converting from ten thousandths of arc
       seconds to radians in the process. */

    deltaPsi = dp / (3600.0 * 10000.0);
    deltaEpsilon = de / (3600.0 * 10000.0);

    return new Array(deltaPsi, deltaEpsilon);
}

/*  ECLIPTOEQ  --  Convert celestial (ecliptical) longitude and
                   latitude into right ascension (in degrees) and
                   declination.  We must supply the time of the
                   conversion in order to compensate correctly for the
                   varying obliquity of the ecliptic over time.
                   The right ascension and declination are returned
                   as a two-element Array in that order.  */

function ecliptoeq(jd, Lambda, Beta) {
    var eps, Ra, Dec;

    /* Obliquity of the ecliptic. */

    eps = dtr(obliqeq(jd));
    log += "Obliquity: " + rtd(eps) + "\n";

    Ra = rtd(Math.atan2((Math.cos(eps) * Math.sin(dtr(Lambda)) -
            (Math.tan(dtr(Beta)) * Math.sin(eps))),
        Math.cos(dtr(Lambda))));
    log += "RA = " + Ra + "\n";
    Ra = fixangle(rtd(Math.atan2((Math.cos(eps) * Math.sin(dtr(Lambda)) -
            (Math.tan(dtr(Beta)) * Math.sin(eps))),
        Math.cos(dtr(Lambda)))));
    Dec = rtd(Math.asin((Math.sin(eps) * Math.sin(dtr(Lambda)) * Math.cos(dtr(Beta))) +
        (Math.sin(dtr(Beta)) * Math.cos(eps))));

    return new Array(Ra, Dec);
}


/*  DELTAT  --  Determine the difference, in seconds, between
                Dynamical time and Universal time.  */

/*  Table of observed Delta T values at the beginning of
    even numbered years from 1620 through 2002.  */

var deltaTtab = new Array(
    121, 112, 103, 95, 88, 82, 77, 72, 68, 63, 60, 56, 53, 51, 48, 46,
    44, 42, 40, 38, 35, 33, 31, 29, 26, 24, 22, 20, 18, 16, 14, 12,
    11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10,
    10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13,
    13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16,
    16, 16, 15, 15, 14, 13, 13.1, 12.5, 12.2, 12, 12, 12, 12, 12, 12,
    11.9, 11.6, 11, 10.2, 9.2, 8.2, 7.1, 6.2, 5.6, 5.4, 5.3, 5.4, 5.6,
    5.9, 6.2, 6.5, 6.8, 7.1, 7.3, 7.5, 7.6, 7.7, 7.3, 6.2, 5.2, 2.7,
    1.4, -1.2, -2.8, -3.8, -4.8, -5.5, -5.3, -5.6, -5.7, -5.9, -6, -6.3, -6.5, -6.2, -4.7, -2.8, -0.1, 2.6, 5.3, 7.7, 10.4, 13.3, 16,
    18.2, 20.2, 21.1, 22.4, 23.5, 23.8, 24.3, 24, 23.9, 23.9, 23.7,
    24, 24.3, 25.3, 26.2, 27.3, 28.2, 29.1, 30, 30.7, 31.4, 32.2,
    33.1, 34, 35, 36.5, 38.3, 40.2, 42.2, 44.5, 46.5, 48.5, 50.5,
    52.2, 53.8, 54.9, 55.8, 56.9, 58.3, 60, 61.6, 63, 65, 66.6
);

function deltat(year) {
    var dt, f, i, t;

    if ((year >= 1620) && (year <= 2000)) {
        i = Math.floor((year - 1620) / 2);
        f = ((year - 1620) / 2) - i; /* Fractional part of year */
        dt = deltaTtab[i] + ((deltaTtab[i + 1] - deltaTtab[i]) * f);
    } else {
        t = (year - 2000) / 100;
        if (year < 948) {
            dt = 2177 + (497 * t) + (44.1 * t * t);
        } else {
            dt = 102 + (102 * t) + (25.3 * t * t);
            if ((year > 2000) && (year < 2100)) {
                dt += 0.37 * (year - 2100);
            }
        }
    }
    return dt;
}

/*  EQUINOX  --  Determine the Julian Ephemeris Day of an
                 equinox or solstice.  The "which" argument
                 selects the item to be computed:

                    0   March equinox
                    1   June solstice
                    2   September equinox
                    3   December solstice

*/

//  Periodic terms to obtain true time

var EquinoxpTerms = new Array(
    485, 324.96, 1934.136,
    203, 337.23, 32964.467,
    199, 342.08, 20.186,
    182, 27.85, 445267.112,
    156, 73.14, 45036.886,
    136, 171.52, 22518.443,
    77, 222.54, 65928.934,
    74, 296.72, 3034.906,
    70, 243.58, 9037.513,
    58, 119.81, 33718.147,
    52, 297.17, 150.678,
    50, 21.02, 2281.226,
    45, 247.54, 29929.562,
    44, 325.15, 31555.956,
    29, 60.93, 4443.417,
    18, 155.12, 67555.328,
    17, 288.79, 4562.452,
    16, 198.04, 62894.029,
    14, 199.76, 31436.921,
    12, 95.39, 14577.848,
    12, 287.11, 31931.756,
    12, 320.81, 34777.259,
    9, 227.73, 1222.114,
    8, 15.45, 16859.074
);

var JDE0tab1000 = new Array(
    new Array(1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071),
    new Array(1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025),
    new Array(1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074),
    new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)
);

var JDE0tab2000 = new Array(
    new Array(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),
    new Array(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),
    new Array(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),
    new Array(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)
);

function equinox(year, which) {
    var deltaL, i, j, JDE0, JDE, JDE0tab, S, T, W, Y;

    /*  Initialise terms for mean equinox and solstices.  We
        have two sets: one for years prior to 1000 and a second
        for subsequent years.  */

    if (year < 1000) {
        JDE0tab = JDE0tab1000;
        Y = year / 1000;
    } else {
        JDE0tab = JDE0tab2000;
        Y = (year - 2000) / 1000;
    }

    JDE0 = JDE0tab[which][0] +
        (JDE0tab[which][1] * Y) +
        (JDE0tab[which][2] * Y * Y) +
        (JDE0tab[which][3] * Y * Y * Y) +
        (JDE0tab[which][4] * Y * Y * Y * Y);

    //document.debug.log.value += "JDE0 = " + JDE0 + "\n";

    T = (JDE0 - 2451545.0) / 36525;
    //document.debug.log.value += "T = " + T + "\n";
    W = (35999.373 * T) - 2.47;
    //document.debug.log.value += "W = " + W + "\n";
    deltaL = 1 + (0.0334 * dcos(W)) + (0.0007 * dcos(2 * W));
    //document.debug.log.value += "deltaL = " + deltaL + "\n";

    //  Sum the periodic terms for time T

    S = 0;
    for (i = j = 0; i < 24; i++) {
        S += EquinoxpTerms[j] * dcos(EquinoxpTerms[j + 1] + (EquinoxpTerms[j + 2] * T));
        j += 3;
    }

    //document.debug.log.value += "S = " + S + "\n";
    //document.debug.log.value += "Corr = " + ((S * 0.00001) / deltaL) + "\n";

    JDE = JDE0 + ((S * 0.00001) / deltaL);

    return JDE;
}

/*  SUNPOS  --  Position of the Sun.  Please see the comments
                on the return statement at the end of this function
                which describe the array it returns.  We return
                intermediate values because they are useful in a
                variety of other contexts.  */

function sunpos(jd) {
    var T, T2, L0, M, e, C, sunLong, sunAnomaly, sunR,
        Omega, Lambda, epsilon, epsilon0, Alpha, Delta,
        AlphaApp, DeltaApp;

    T = (jd - J2000) / JulianCentury;
    //document.debug.log.value += "Sunpos.  T = " + T + "\n";
    T2 = T * T;
    L0 = 280.46646 + (36000.76983 * T) + (0.0003032 * T2);
    //document.debug.log.value += "L0 = " + L0 + "\n";
    L0 = fixangle(L0);
    //document.debug.log.value += "L0 = " + L0 + "\n";
    M = 357.52911 + (35999.05029 * T) + (-0.0001537 * T2);
    //document.debug.log.value += "M = " + M + "\n";
    M = fixangle(M);
    //document.debug.log.value += "M = " + M + "\n";
    e = 0.016708634 + (-0.000042037 * T) + (-0.0000001267 * T2);
    //document.debug.log.value += "e = " + e + "\n";
    C = ((1.914602 + (-0.004817 * T) + (-0.000014 * T2)) * dsin(M)) +
        ((0.019993 - (0.000101 * T)) * dsin(2 * M)) +
        (0.000289 * dsin(3 * M));
    //document.debug.log.value += "C = " + C + "\n";
    sunLong = L0 + C;
    //document.debug.log.value += "sunLong = " + sunLong + "\n";
    sunAnomaly = M + C;
    //document.debug.log.value += "sunAnomaly = " + sunAnomaly + "\n";
    sunR = (1.000001018 * (1 - (e * e))) / (1 + (e * dcos(sunAnomaly)));
    //document.debug.log.value += "sunR = " + sunR + "\n";
    Omega = 125.04 - (1934.136 * T);
    //document.debug.log.value += "Omega = " + Omega + "\n";
    Lambda = sunLong + (-0.00569) + (-0.00478 * dsin(Omega));
    //document.debug.log.value += "Lambda = " + Lambda + "\n";
    epsilon0 = obliqeq(jd);
    //document.debug.log.value += "epsilon0 = " + epsilon0 + "\n";
    epsilon = epsilon0 + (0.00256 * dcos(Omega));
    //document.debug.log.value += "epsilon = " + epsilon + "\n";
    Alpha = rtd(Math.atan2(dcos(epsilon0) * dsin(sunLong), dcos(sunLong)));
    //document.debug.log.value += "Alpha = " + Alpha + "\n";
    Alpha = fixangle(Alpha);
    ////document.debug.log.value += "Alpha = " + Alpha + "\n";
    Delta = rtd(Math.asin(dsin(epsilon0) * dsin(sunLong)));
    ////document.debug.log.value += "Delta = " + Delta + "\n";
    AlphaApp = rtd(Math.atan2(dcos(epsilon) * dsin(Lambda), dcos(Lambda)));
    //document.debug.log.value += "AlphaApp = " + AlphaApp + "\n";
    AlphaApp = fixangle(AlphaApp);
    //document.debug.log.value += "AlphaApp = " + AlphaApp + "\n";
    DeltaApp = rtd(Math.asin(dsin(epsilon) * dsin(Lambda)));
    //document.debug.log.value += "DeltaApp = " + DeltaApp + "\n";

    return new Array( //  Angular quantities are expressed in decimal degrees
        L0, //  [0] Geometric mean longitude of the Sun
        M, //  [1] Mean anomaly of the Sun
        e, //  [2] Eccentricity of the Earth's orbit
        C, //  [3] Sun's equation of the Centre
        sunLong, //  [4] Sun's true longitude
        sunAnomaly, //  [5] Sun's true anomaly
        sunR, //  [6] Sun's radius vector in AU
        Lambda, //  [7] Sun's apparent longitude at true equinox of the date
        Alpha, //  [8] Sun's true right ascension
        Delta, //  [9] Sun's true declination
        AlphaApp, // [10] Sun's apparent right ascension
        DeltaApp // [11] Sun's apparent declination
    );
}

/*  EQUATIONOFTIME  --  Compute equation of time for a given moment.
                        Returns the equation of time as a fraction of
                        a day.  */

function equationOfTime(jd) {
    var alpha, deltaPsi, E, epsilon, L0, tau

    tau = (jd - J2000) / JulianMillennium;
    //document.debug.log.value += "equationOfTime.  tau = " + tau + "\n";
    L0 = 280.4664567 + (360007.6982779 * tau) +
        (0.03032028 * tau * tau) +
        ((tau * tau * tau) / 49931) +
        (-((tau * tau * tau * tau) / 15300)) +
        (-((tau * tau * tau * tau * tau) / 2000000));
    //document.debug.log.value += "L0 = " + L0 + "\n";
    L0 = fixangle(L0);
    //document.debug.log.value += "L0 = " + L0 + "\n";
    alpha = sunpos(jd)[10];
    //document.debug.log.value += "alpha = " + alpha + "\n";
    deltaPsi = nutation(jd)[0];
    //document.debug.log.value += "deltaPsi = " + deltaPsi + "\n";
    epsilon = obliqeq(jd) + nutation(jd)[1];
    //document.debug.log.value += "epsilon = " + epsilon + "\n";
    E = L0 + (-0.0057183) + (-alpha) + (deltaPsi * dcos(epsilon));
    //document.debug.log.value += "E = " + E + "\n";
    E = E - 20.0 * (Math.floor(E / 20.0));
    //document.debug.log.value += "Efixed = " + E + "\n";
    E = E / (24 * 60);
    //document.debug.log.value += "Eday = " + E + "\n";

    return E;
}

/*
       JavaScript functions for the Fourmilab Calendar Converter

                  by John Walker  --  September, MIM
              http://www.fourmilab.ch/documents/calendar/

                This program is in the public domain.
*/

/*  You may notice that a variety of array variables logically local
    to functions are declared globally here.  In JavaScript, construction
    of an array variable from source code occurs as the code is
    interpreted.  Making these variables pseudo-globals permits us
    to avoid overhead constructing and disposing of them in each
    call on the function in which whey are used.  */

var J0000 = 1721424.5; // Julian date of Gregorian epoch: 0000-01-01
var J1970 = 2440587.5; // Julian date at Unix epoch: 1970-01-01
var JMJD = 2400000.5; // Epoch of Modified Julian Date system
var J1900 = 2415020.5; // Epoch (day 1) of Excel 1900 date system (PC)
var J1904 = 2416480.5; // Epoch (day 0) of Excel 1904 date system (Mac)

var NormLeap = new Array("Normal year", "Leap year");

/*  WEEKDAY_BEFORE  --  Return Julian date of given weekday (0 = Sunday)
                        in the seven days ending on jd.  */

function weekday_before(weekday, jd) {
    return jd - jwday(jd - weekday);
}

/*  SEARCH_WEEKDAY  --  Determine the Julian date for:

            weekday      Day of week desired, 0 = Sunday
            jd           Julian date to begin search
            direction    1 = next weekday, -1 = last weekday
            offset       Offset from jd to begin search
*/

function search_weekday(weekday, jd, direction, offset) {
    return weekday_before(weekday, jd + (direction * offset));
}

//  Utility weekday functions, just wrappers for search_weekday

function nearest_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 3);
}

function next_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 7);
}

function next_or_current_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 6);
}

function previous_weekday(weekday, jd) {
    return search_weekday(weekday, jd, -1, 1);
}

function previous_or_current_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 0);
}

//  LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?

function leap_gregorian(year) {
    return ((year % 4) == 0) &&
        (!(((year % 100) == 0) && ((year % 400) != 0)));
}

//  GREGORIAN_TO_JD  --  Determine Julian day number from Gregorian calendar date

var GREGORIAN_EPOCH = 1721425.5;

function gregorian_to_jd(year, month, day) {
    return (GREGORIAN_EPOCH - 1) +
        (365 * (year - 1)) +
        Math.floor((year - 1) / 4) +
        (-Math.floor((year - 1) / 100)) +
        Math.floor((year - 1) / 400) +
        Math.floor((((367 * month) - 362) / 12) +
            ((month <= 2) ? 0 :
                (leap_gregorian(year) ? -1 : -2)
            ) +
            day);
}

//  JD_TO_GREGORIAN  --  Calculate Gregorian calendar date from Julian day

function jd_to_gregorian(jd) {
    var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad,
        yindex, dyindex, year, yearday, leapadj;

    wjd = Math.floor(jd - 0.5) + 0.5;
    depoch = wjd - GREGORIAN_EPOCH;
    quadricent = Math.floor(depoch / 146097);
    dqc = mod(depoch, 146097);
    cent = Math.floor(dqc / 36524);
    dcent = mod(dqc, 36524);
    quad = Math.floor(dcent / 1461);
    dquad = mod(dcent, 1461);
    yindex = Math.floor(dquad / 365);
    year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
    if (!((cent == 4) || (yindex == 4))) {
        year++;
    }
    yearday = wjd - gregorian_to_jd(year, 1, 1);
    leapadj = ((wjd < gregorian_to_jd(year, 3, 1)) ? 0 :
        (leap_gregorian(year) ? 1 : 2)
    );
    var month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
    var day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

    return new Array(year, month, day);
}

//  ISO_TO_JULIAN  --  Return Julian day of given ISO year, week, and day

function n_weeks(weekday, jd, nthweek) {
    var j = 7 * nthweek;

    if (nthweek > 0) {
        j += previous_weekday(weekday, jd);
    } else {
        j += next_weekday(weekday, jd);
    }
    return j;
}

function iso_to_julian(year, week, day) {
    return day + n_weeks(0, gregorian_to_jd(year - 1, 12, 28), week);
}

//  HEBREW_TO_JD  --  Determine Julian day from Hebrew date

var HEBREW_EPOCH = 347995.5;

//  Is a given Hebrew year a leap year ?

function hebrew_leap(year) {
    return mod(((year * 7) + 1), 19) < 7;
}

//  How many months are there in a Hebrew year (12 = normal, 13 = leap)

function hebrew_year_months(year) {
    return hebrew_leap(year) ? 13 : 12;
}

//  Test for delay of start of new year and to avoid
//  Sunday, Wednesday, and Friday as start of the new year.

function hebrew_delay_1(year) {
    var months, days, parts;

    months = Math.floor(((235 * year) - 234) / 19);
    parts = 12084 + (13753 * months);
    var day = (months * 29) + Math.floor(parts / 25920);

    if (mod((3 * (day + 1)), 7) < 3) {
        day++;
    }
    return day;
}

//  Check for delay in start of new year due to length of adjacent years

function hebrew_delay_2(year) {
    var last, present, next;

    last = hebrew_delay_1(year - 1);
    present = hebrew_delay_1(year);
    next = hebrew_delay_1(year + 1);

    return ((next - present) == 356) ? 2 :
        (((present - last) == 382) ? 1 : 0);
}

//  How many days are in a Hebrew year ?

function hebrew_year_days(year) {
    return hebrew_to_jd(year + 1, 7, 1) - hebrew_to_jd(year, 7, 1);
}

//  How many days are in a given month of a given year

function hebrew_month_days(year, month) {
    //  First of all, dispose of fixed-length 29 day months

    if (month == 2 || month == 4 || month == 6 ||
        month == 10 || month == 13) {
        return 29;
    }

    //  If it's not a leap year, Adar has 29 days

    if (month == 12 && !hebrew_leap(year)) {
        return 29;
    }

    //  If it's Heshvan, days depend on length of year

    if (month == 8 && !(mod(hebrew_year_days(year), 10) == 5)) {
        return 29;
    }

    //  Similarly, Kislev varies with the length of year

    if (month == 9 && (mod(hebrew_year_days(year), 10) == 3)) {
        return 29;
    }

    //  Nope, it's a 30 day month

    return 30;
}

//  Finally, wrap it all up into...

function hebrew_to_jd(year, month, day) {
    var jd, mon, months;

    months = hebrew_year_months(year);
    jd = HEBREW_EPOCH + hebrew_delay_1(year) +
        hebrew_delay_2(year) + day + 1;

    if (month < 7) {
        for (mon = 7; mon <= months; mon++) {
            jd += hebrew_month_days(year, mon);
        }
        for (mon = 1; mon < month; mon++) {
            jd += hebrew_month_days(year, mon);
        }
    } else {
        for (mon = 7; mon < month; mon++) {
            jd += hebrew_month_days(year, mon);
        }
    }

    return jd;
}

//  LEAP_PERSIAN  --  Is a given year a leap year in the Persian calendar ?

function leap_persian(year) {
    return ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
}

//  PERSIAN_TO_JD  --  Determine Julian day from Persian date

var PERSIAN_EPOCH = 1948320.5;
var PERSIAN_WEEKDAYS = new Array("Yekshanbeh", "Doshanbeh",
    "Seshhanbeh", "Chaharshanbeh",
    "Panjshanbeh", "Jomeh", "Shanbeh");

function persian_to_jd(year, month, day) {
    var epbase, epyear;

    epbase = year - ((year >= 0) ? 474 : 473);
    epyear = 474 + mod(epbase, 2820);

    return day +
        ((month <= 7) ?
            ((month - 1) * 31) :
            (((month - 1) * 30) + 6)
        ) +
        Math.floor(((epyear * 682) - 110) / 2816) +
        (epyear - 1) * 365 +
        Math.floor(epbase / 2820) * 1029983 +
        (PERSIAN_EPOCH - 1);
}

//  JD_TO_PERSIAN  --  Calculate Persian date from Julian day

function jd_to_persian(jd) {
    var year, month, day, depoch, cycle, cyear, ycycle,
        aux1, aux2, yday;


    jd = Math.floor(jd) + 0.5;

    depoch = jd - persian_to_jd(475, 1, 1);
    cycle = Math.floor(depoch / 1029983);
    cyear = mod(depoch, 1029983);
    if (cyear == 1029982) {
        ycycle = 2820;
    } else {
        aux1 = Math.floor(cyear / 366);
        aux2 = mod(cyear, 366);
        ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) +
            aux1 + 1;
    }
    year = ycycle + (2820 * cycle) + 474;
    if (year <= 0) {
        year--;
    }
    yday = (jd - persian_to_jd(year, 1, 1)) + 1;
    month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
    day = (jd - persian_to_jd(year, month, 1)) + 1;
    return new Array(year, month, day);
}

export default function JDate(i, h, f) {
    var d;
    var a;
    if (!isNaN(parseInt(i)) && !isNaN(parseInt(h)) && !isNaN(parseInt(f))) {
        var c = j([parseInt(i, 10), parseInt(h, 10), parseInt(f, 10)]);
        e(new Date(c[0], c[1], c[2]))    } else {
        e(i)
    }

    this.isDate = true;

    function j(l) {
        var k = 0;
        if (l[1] < 0) {
            k = leap_persian(l[0] - 1) ? 30 : 29;
            l[1]++
        }
        var g = jd_to_gregorian(persian_to_jd(l[0], l[1] + 1, l[2]) - k);
        g[1]--;
        return g
    }

    function b(k) {
        var g = jd_to_persian(gregorian_to_jd(k[0], k[1] + 1, k[2]));
        g[1]--;
        return g
    }

    function e(g) {
        if (g && g.getGregorianDate) {
            g = g.getGregorianDate()
        }
        d = new Date(g);
        d.setHours(d.getHours() > 12 ? d.getHours() + 2 : 2);
        if (!d || d == "Invalid Date" || isNaN(d || !d.getDate())) {
            d = new Date()
        }
        a = b([d.getFullYear(), d.getMonth(), d.getDate()]);
        return this
    }
    this.getGregorianDate = function() {
        d.setHours(d.getHours() > 12 ? d.getHours() + 2 : 2);
        return d
    };
    this.setFullDate = e;
    this.setGregorianDate = function(year, month, day){
        d = new Date(year, month, day);
        a = b([year, month, day]);
    };
    this.setYear = function(l) {
        a[0] = l;
        var k = j(a);
        d = new Date(k[0], k[1], k[2]);
        a = b([k[0], k[1], k[2]])
    };
    this.setMonth = function(l) {
        a[1] = l;
        var k = j(a);
        d = new Date(k[0], k[1], k[2]);
        a = b([k[0], k[1], k[2]])
    };
    this.setDate = function(l) {
        a[2] = l;
        var k = j(a);
        d = new Date(k[0], k[1], k[2]);
        a = b([k[0], k[1], k[2]])
    };
    this.getFullYear = function() {
        return a[0]
    };
    this.getMonth = function() {
        return a[1]
    };
    this.getDate = function() {
        return a[2]
    };
    this.toString = function() {
        return a.join(",").toString()
    };
    this.getDay = function() {
        d.setHours(d.getHours() > 12 ? d.getHours() + 2 : 2);
        return d.getDay()
    };
    this.getUTCDay = function() {
        return d.getUTCDay()
    };
    this.getHours = function() {
        return d.getHours()
    };
    this.getMinutes = function() {
        return d.getMinutes()
    };
    this.getSeconds = function() {
        return d.getSeconds()
    };
    this.getTime = function() {
        return d.getTime()
    };
    this.getTimezoneOffset = function() {
        return d.getTimezoneOffset()
    };
    this.getYear = function() {
        return a[0] % 100
    };
	  this.setTime = function(g) {
        d.setTime(g)
    };
    this.setHours = function(g) {
        d.setHours(g)
    };
    this.setMinutes = function(g) {
        d.setMinutes(g)
    };
    this.setSeconds = function(g) {
        d.setSeconds(g)
    };
    this.setMilliseconds = function(g) {
        d.setMilliseconds(g)
    };
    this.getMilliseconds = function() {
        return d.getMilliseconds();
    };
    this.getTime = function() {
      return d.getTime();
    };
    this.isGreaterThan = function(date) {
      return this.getYear() > date.getYear() || (this.getYear() == date.getYear() && this.getMonth() > date.getMonth()) || (this.getYear() == date.getYear() && this.getMonth() == date.getMonth() && this.getDate() > date.getDate());
    }
    this.getDays = function() {
      return Math.floor(this.getTime() / 1000 / 3600 / 24);
    }
};

Date.prototype.isGreaterThan = function(date) {
  return this > date;
}

Date.prototype.getDays = function() {
  return Math.floor(this.getTime() / 1000 / 3600 / 24);
}
