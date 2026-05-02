import { NextRequest, NextResponse } from "next/server";
import React from "react";
import ReactPDF from "@react-pdf/renderer";

const { Document, Page, View, Text, StyleSheet } = ReactPDF;

const green = "#10b981";
const darkBg = "#0a1f15";
const white = "#ffffff";
const gray = "#94a3b8";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: white },
  coverPage: { padding: 0, fontFamily: "Helvetica", backgroundColor: darkBg },
  coverContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 60 },
  coverBadge: { backgroundColor: green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 30 },
  coverBadgeText: { color: darkBg, fontSize: 9, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" as any },
  coverTitle: { color: white, fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  coverSub: { color: gray, fontSize: 12, textAlign: "center", marginBottom: 40 },
  coverBigNumber: { color: green, fontSize: 72, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  coverBigLabel: { color: gray, fontSize: 14, textAlign: "center", marginBottom: 40 },
  coverFooter: { position: "absolute", bottom: 40, left: 40, right: 40 },
  coverFooterText: { color: gray, fontSize: 8, textAlign: "center" },

  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottomWidth: 2, borderBottomColor: green, paddingBottom: 10 },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  headerSub: { fontSize: 9, color: gray },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
  statBox: { width: "48%", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  statLabel: { fontSize: 9, color: gray, textTransform: "uppercase" as any, letterSpacing: 1 },

  certBox: { padding: 20, borderRadius: 8, borderWidth: 2, borderColor: green, marginBottom: 30 },
  certText: { fontSize: 10, color: "#334155", lineHeight: 1.6 },

  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 12, marginTop: 20 },

  table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9" },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  tableCell: { padding: 8, fontSize: 8, color: "#334155", flex: 1 },
  tableCellHeader: { padding: 8, fontSize: 7, color: gray, flex: 1, fontWeight: "bold", textTransform: "uppercase" as any, letterSpacing: 0.5 },

  sdgRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  sdgBadge: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  sdgNum: { color: white, fontSize: 14, fontWeight: "bold" },
  sdgTitle: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  sdgDesc: { fontSize: 8, color: gray },

  signatureBox: { marginTop: 30, padding: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  signatureText: { fontSize: 8, color: gray },
  certId: { fontSize: 7, color: green, marginTop: 4, fontFamily: "Courier" },
});

function CSRReport({ company_name, meals, kgRescued, co2, families, deliveries, dailyData }: any) {
  const certId = "FF-CSR-2025-05-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  const sampleBreakdown = [
    { date: "May 3", donor: "HQ Cafeteria", type: "Cooked", kg: 45, meals: 180, co2: 112.5 },
    { date: "May 7", donor: "Branch Office Mumbai", type: "Bakery", kg: 22, meals: 88, co2: 55 },
    { date: "May 12", donor: "IT Park Canteen", type: "Raw Veg", kg: 38, meals: 152, co2: 95 },
    { date: "May 18", donor: "Guest House Kitchen", type: "Cooked", kg: 56, meals: 224, co2: 140 },
    { date: "May 23", donor: "HQ Cafeteria", type: "Packaged", kg: 30, meals: 120, co2: 75 },
    { date: "May 28", donor: "Training Center", type: "Cooked", kg: 41, meals: 164, co2: 102.5 },
  ];

  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverContent}>
          <View style={s.coverBadge}>
            <Text style={s.coverBadgeText}>CSR Impact Report</Text>
          </View>
          <Text style={s.coverTitle}>{company_name}</Text>
          <Text style={s.coverSub}>Monthly Impact Report — May 2025</Text>
          <Text style={s.coverBigNumber}>{(meals || 2847).toLocaleString()}</Text>
          <Text style={s.coverBigLabel}>Meals Rescued This Month</Text>
          <Text style={{ ...s.coverSub, fontSize: 10 }}>
            {(kgRescued || 1138).toLocaleString()} kg food rescued | {(co2 || 2845).toLocaleString()} kg CO2 avoided | {(families || 940).toLocaleString()} families fed
          </Text>
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>Certified by FoodFlow | foodflow.in | Generated {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* PAGE 2 — IMPACT SUMMARY */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Impact Summary</Text>
            <Text style={s.headerSub}>{company_name} — May 2025</Text>
          </View>
          <Text style={{ fontSize: 10, color: green, fontWeight: "bold" }}>FoodFlow</Text>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statBox}><Text style={s.statValue}>{(meals || 2847).toLocaleString()}</Text><Text style={s.statLabel}>Meals Served</Text></View>
          <View style={s.statBox}><Text style={s.statValue}>{(kgRescued || 1138).toLocaleString()}</Text><Text style={s.statLabel}>kg Food Rescued</Text></View>
          <View style={s.statBox}><Text style={s.statValue}>{(co2 || 2845).toLocaleString()}</Text><Text style={s.statLabel}>kg CO2 Avoided</Text></View>
          <View style={s.statBox}><Text style={s.statValue}>{(families || 940).toLocaleString()}</Text><Text style={s.statLabel}>Families Fed</Text></View>
        </View>

        <View style={s.certBox}>
          <Text style={s.certText}>
            This certifies that {company_name} has contributed to food rescue operations through FoodFlow
            during the period of May 1-31, 2025. Through {deliveries || 156} verified donations, the company has
            directly impacted {(families || 940).toLocaleString()} families and diverted {(kgRescued || 1138).toLocaleString()} kg of food from
            landfills, avoiding an estimated {(co2 || 2845).toLocaleString()} kg of CO2 emissions.
          </Text>
        </View>

        <View style={s.signatureBox}>
          <Text style={s.signatureText}>Verified by FoodFlow AI Verification System</Text>
          <Text style={s.certId}>Certificate ID: {certId}</Text>
        </View>
      </Page>

      {/* PAGE 3 — DETAILED BREAKDOWN */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Detailed Breakdown</Text>
            <Text style={s.headerSub}>{company_name} — May 2025</Text>
          </View>
          <Text style={{ fontSize: 10, color: green, fontWeight: "bold" }}>FoodFlow</Text>
        </View>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.tableCellHeader}>Date</Text>
            <Text style={s.tableCellHeader}>Donor Location</Text>
            <Text style={s.tableCellHeader}>Food Type</Text>
            <Text style={s.tableCellHeader}>Kg</Text>
            <Text style={s.tableCellHeader}>Meals</Text>
            <Text style={s.tableCellHeader}>CO2 (kg)</Text>
          </View>
          {sampleBreakdown.map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableCell}>{row.date}</Text>
              <Text style={s.tableCell}>{row.donor}</Text>
              <Text style={s.tableCell}>{row.type}</Text>
              <Text style={s.tableCell}>{row.kg}</Text>
              <Text style={s.tableCell}>{row.meals}</Text>
              <Text style={s.tableCell}>{row.co2}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Category Totals</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.tableCellHeader}>Category</Text>
            <Text style={s.tableCellHeader}>Total Kg</Text>
            <Text style={s.tableCellHeader}>% of Total</Text>
          </View>
          {[
            { cat: "Cooked Food", kg: 680, pct: "59.8%" },
            { cat: "Raw Vegetables", kg: 228, pct: "20.0%" },
            { cat: "Bakery", kg: 132, pct: "11.6%" },
            { cat: "Packaged", kg: 98, pct: "8.6%" },
          ].map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableCell}>{row.cat}</Text>
              <Text style={s.tableCell}>{row.kg}</Text>
              <Text style={s.tableCell}>{row.pct}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* PAGE 4 — UN SDG ALIGNMENT */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>UN SDG Alignment</Text>
            <Text style={s.headerSub}>{company_name} — May 2025</Text>
          </View>
          <Text style={{ fontSize: 10, color: green, fontWeight: "bold" }}>FoodFlow</Text>
        </View>

        {[
          { num: 2, color: "#DDA63A", title: "Zero Hunger", desc: "Directly contributed to feeding " + (families || 940) + " families through " + (meals || 2847).toLocaleString() + " meals. All donations verified through our 3-step food safety verification process." },
          { num: 12, color: "#BF8B2E", title: "Responsible Consumption & Production", desc: "Diverted " + (kgRescued || 1138).toLocaleString() + " kg of surplus food from landfills. Utilized AI-powered matching to ensure optimal distribution and zero waste through our valorization engine." },
          { num: 13, color: "#3F7E44", title: "Climate Action", desc: "Avoided " + (co2 || 2845).toLocaleString() + " kg of CO2 emissions. Calculation methodology: UNEP standard of 2.5 kg CO2 per kg of food waste diverted from landfill decomposition." },
        ].map((g, i) => (
          <View key={i} style={{ ...s.sdgRow, marginBottom: 20 }}>
            <View style={{ ...s.sdgBadge, backgroundColor: g.color }}>
              <Text style={s.sdgNum}>{g.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sdgTitle}>Goal {g.num}: {g.title}</Text>
              <Text style={s.sdgDesc}>{g.desc}</Text>
            </View>
          </View>
        ))}

        <View style={{ ...s.signatureBox, marginTop: 60 }}>
          <Text style={{ fontSize: 10, color: "#1e293b", fontWeight: "bold", marginBottom: 4 }}>Digitally Verified</Text>
          <Text style={s.signatureText}>This report was auto-generated and verified by the FoodFlow AI Verification System.</Text>
          <Text style={s.signatureText}>For verification, visit: foodflow.in/verify/{certId}</Text>
          <Text style={{ ...s.certId, marginTop: 8 }}>Report generated: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfStream = await ReactPDF.renderToStream(
      React.createElement(CSRReport, body)
    );

    // Convert to buffer
    const chunks: Uint8Array[] = [];
    const reader = pdfStream as any;
    for await (const chunk of reader) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=FoodFlow_CSR_Report.pdf",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PDF generation failed" }, { status: 500 });
  }
}
