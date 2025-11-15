import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const CustomTable = ({ data = [], keys = [] }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      style={{ border: "#515677", borderRadius: 8 }}
      className="h-fit"
    >
      <Table
        // sx={{ minWidth: 650 }}
        stickyHeader
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {keys.map((i, index) => (
              <TableCell
                key={index}
                align="left"
                style={{
                  borderLeft: index !== 0 ? "#515677" : "none",
                  color: "#7D7D7D",
                  fontSize: "12px",
                  letterSpacing: "-1%",
                  lineHeight: "20px",
                  fontWeight: 500,
                  fontFamily: "Golos Text",
                  paddingTop: 13,
                  paddingBottom: 12,
                  paddingRight: 9,
                  paddingLeft: 9,
                }}
              >
                {i}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, key) => (
            <TableRow
              key={key}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {Object.keys(row)?.map((i, index) => (
                <TableCell
                  key={index}
                  align={index !== 0 ? "left" : "center"}
                  component="th"
                  scope="row"
                  style={{
                    borderLeft: index !== 0 ? "#515677" : "none",
                    color: "#7D7D7D",
                    fontSize: "12px",
                    letterSpacing: "-1%",
                    lineHeight: "20px",
                    fontWeight: 500,
                    fontFamily: "Golos Text",
                    paddingTop: 13,
                    paddingBottom: 12,
                    paddingRight: index !== 0 ? 9 : 18,
                    paddingLeft: index !== 0 ? 9 : 18,
                  }}
                >
                  {index === 0 ? key + 1 : row[i]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
