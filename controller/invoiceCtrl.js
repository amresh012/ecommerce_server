const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];
const teens = [
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertToWords(num) {
  if (num === 0) {
    return "Zero";
  }

  function convertChunk(number) {
    let result = "";

    if (number >= 100) {
      result += ones[Math.floor(number / 100)] + " Hundred ";
      number %= 100;
    }

    if (number >= 11 && number <= 19) {
      result += teens[number - 11] + " ";
    } else if (number >= 20 || number === 10) {
      result += tens[Math.floor(number / 10)] + " ";
      number %= 10;
    }

    if (number >= 1 && number <= 9) {
      result += ones[number] + " ";
    }

    return result;
  }

  let result = "";
  let chunkCount = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      result =
        convertChunk(chunk) +
        ["", "Thousand", "Million", "Billion"][chunkCount] +
        " " +
        result;
    }
    num = Math.floor(num / 1000);
    chunkCount++;
  }

  return result.trim();
}

const createInvoice = ({
  totalPrice,
  invoiceno,
  userName,
  userAdress,
  productDetails,
  isCoupon,
  gstNo,
}) => {
  const companyName = "KFS Fitness ";
  const compayAdderss =
    "Kuber Tower, Ajronda, Sec- 20B Faridabad, Haryana, India 121002";
  const conatactNumbers = "9650104416";
  const contactEmail = "info@kfsfitness.com";
  const placeOfSupply = "Faridabad,Haryana(Sec- 20B)";
  const bankName = `BANK NAME:- UCO BANK BRANCH:-MAIN BRANCH FARIDABAD Account No:- 03900510001257 IFSC Code:-
UCBA0000390`;
  const date = new Date();
  const invoiceDate = JSON.stringify(date).split("T")[0].split('"')[1];
  const products = productDetails
    .map((pro, i) => {
      return `<tr>
          <td>${i + 1}</td>
          <td>${pro.name}</td>
          <td> ${pro.hsn || "-"}</td>
          <td>${pro.count}</td>
          <td>${pro.unit}</td>
          <td> ${pro.total / pro.count}</td>
          <td>${pro.total} ₹</td>
        </tr>`;
    })
    .join("");
  const totalQty = productDetails.count;
  const alphabeticalPrice = convertToWords(parseInt(totalPrice));
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KFS FITNESS INVOICE</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto+Slab&family=Rubik&display=swap");

        .mainContainer {
            border: 1px solid black;
            max-width: auto; /* Set a max width for the invoice */
            margin: auto; /* Center the invoice */
            padding: 10px; /* Add some padding */
            overflow: hidden; /* Clear floats */
        }

        .nameContainer {
            border-bottom: 1px solid black;
            display: flex;
            flex-direction: column;
            padding: 4px;
        }

        .gst {
            display: flex;
            justify-content: space-between;
        }

        h4 {
            margin: 0;
            text-align: center;
        }

        .flex {
            display: flex;
            flex-wrap: wrap; /* Allow wrapping for smaller screens */
        }

        .w-50 {
            flex: 0 0 50%; /* Flex-basis 50% */
            box-sizing: border-box;
        }

        .border {
            border: 1px solid black;
        }

        .text-center {
            text-align: center;
        }

        .text-end {
            text-align: end;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0; /* Add margin to the table */
        }

        th,
        td {
            border: 1px solid black;
            text-align: center;
            padding: 8px;
        }

        /* Responsive styles */
        @media (max-width: 900px) {
            .w-50 {
                flex: 0 0 100%; /* Make items full width on smaller screens */
            }

            .gst {
                flex-direction: column; /* Stack GST info vertically */
                align-items: flex-start; /* Align items to the left */
            }
        }

        /* Additional styling */
        .underline {
            text-decoration: underline;
        }

        .pb {
            padding-bottom: 4px;
        }

        .pt-3 {
            padding-top: 10px !important;
        }

        .mb-4 {
            margin-bottom: 40px;
        }

        .bill strong {
            display: block;
            margin: 4px 0px;
        }

        .terms strong {
            display: block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="mainContainer">
        <div class="nameContainer">
            <div class="gst w-full">
                <p>GSTIN: <strong>07AERFS7014R1Z4</strong></p>
                <p>Original copy</p>
            </div>
            <h4 class="underline pt-2">TAX INVOICE</h4>
            <h2 class="text-center">${companyName}</h2>
            <p class="text-center">${compayAdderss}</p>
            <p class="text-center m-0">Tel.: ${conatactNumbers}, email: ${contactEmail}</p>
        </div>
        <div class="dateCont border-b flex">
            <div class="w-50 border-r pb-4">
                <p class="m-0"><span>Invoice No:</span> ${invoiceno}</p>
                <p class="m-0"><span>Dated:</span> ${invoiceDate}</p>
            </div>
            <div class="w-50 border-l pb-4">
                <p class="m-0"><span>Place of Supply:</span> ${placeOfSupply}</p>
                <p class="m-0"><span>Reverse Charges No:</span> N</p>
            </div>
        </div>
        <div class="shipp border-b flex mb-4">
            <div class="w-50 border-r p-4">
                <p class="m-0 pb bill"><span>Billed to:</span>
                    <strong>${userName}<br>${userAdress || ""}</strong>
                </p>
                ${gstNo ? `<h4 class="m-0 pb bill"><span>GST NO.:</span> ${gstNo}</h4>` : ""}
            </div>
            <div class="w-50 border-l p-4">
                <p class="m-0 pb bill"><span>Shipped to:</span>
                    <strong>${userName}<br>${userAdress || ""}</strong>
                </p>
                ${gstNo ? `<h4 class="m-0 pb bill"><span>GST NO.:</span> ${gstNo}</h4>` : ""}
            </div>
        </div>
        <div class="">
            <table>
                <tr class="border-b">
                    <th>S.N.</th>
                    <th>Description of Goods</th>
                    <th>HSN/SAC Code</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Amount (₹)</th>
                </tr>
                ${products}
            </table>
            ${isCoupon ? `<h4 class="text-end pb-10 m-0"><span>Coupon Discount <span>(&nbsp;${isCoupon?.code}&nbsp;)</span> :</span> &nbsp;- ${isCoupon?.discountrs} ₹</h4>` : ""}
            <h4 class="text-end pb-9 m-0"><span>Total :</span> &nbsp; ${totalPrice} ₹</h4>
            <p class="text-end border-b pt-2 m-0 ">${alphabeticalPrice} Rupees only :-</p>
            <p class="border-b pb-4 m-0"><span>Bank Details :</span> &nbsp; ${bankName}</p>
            <div class="shipp border-b flex">
                <div class="w-[60vw] border-r pb-4">
                    <p class="m-0 pb bill"><span class="underline">Terms & Conditions:</span>
                        <strong>
                            E.& O.E.<br>
                            1. TAXES : GST EXTRA @ 18%.<br>
                            2. PAYMENT: 100% ADVANCE BEFORE DELIVERY<br>
                            3. DELIVERY : WITHIN 3 TO 4 WEEKS <br>
                            4. FREIGHT : EXTRA AS PER ACTUAL<br>.
                            5. UNLOADING : EXTRA <br>.
                            6. INSTALLATION : FREE.
                        </strong>
                    </p>
                </div>
                <div class="w-50 border-l">
                    <p class="border-b pb-4 m-0"><span>Receiver's Signature:</span></p>
                    <h3 class="text-end m-0">For ${companyName}</h3>
                    <p class="text-end m-0">Authorised Signatory</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
  return htmlContent;
};
module.exports = createInvoice;
