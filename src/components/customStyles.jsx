   const customStyles = {
    table: {
      style: {
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
        marginBottom: "1rem",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#005f73",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        minHeight: "52px",
        borderBottom: "2px solid #003d4c",
      },
    },
    headCells: {
      style: {
        padding: "12px 8px",
        textAlign: "left",
        fontWeight: "bold",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        fontWeight: "400",
        color: "#333",
        backgroundColor: "#ffffff",
        minHeight: "50px",
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #ddd",
        },
        "&:hover": {
          backgroundColor: "#e6f2f5",
        },
      },
    },
    cells: {
      style: {
        padding: "12px 8px",
        textAlign: "left",
        borderRight: "1px solid #ddd",
        wordBreak: "break-word",
      },
    },
    };

export default customStyles;