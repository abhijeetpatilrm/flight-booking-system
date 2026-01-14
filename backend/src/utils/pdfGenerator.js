const PDFDocument = require('pdfkit');

function generateTicketPDF(booking, res) {
  try {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${booking.pnr}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('FLIGHT TICKET', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#666666')
      .text('E-Ticket Confirmation', { align: 'center' })
      .fillColor('#000000')
      .moveDown(1.5);

    doc
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .strokeColor('#000000')
      .moveDown(1.2);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('BOOKING REFERENCE (PNR)', { continued: false })
      .fillColor('#000000')
      .moveDown(0.3);

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(booking.pnr, { align: 'left' })
      .moveDown(1.8);

    doc
      .strokeColor('#EEEEEE')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .strokeColor('#000000')
      .moveDown(1.2);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('PASSENGER INFORMATION')
      .moveDown(0.6);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Passenger Name', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(booking.passengerName)
      .font('Helvetica')
      .moveDown(1.5);

    doc
      .strokeColor('#EEEEEE')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .strokeColor('#000000')
      .moveDown(1.2);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('FLIGHT DETAILS')
      .moveDown(0.6);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Airline', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    doc
      .fontSize(12)
      .text(booking.airline)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Flight Number', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    doc
      .fontSize(12)
      .text(booking.flightId)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Route', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(booking.route)
      .font('Helvetica')
      .moveDown(1.5);

    doc
      .strokeColor('#EEEEEE')
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .strokeColor('#000000')
      .moveDown(1.2);

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('BOOKING & PAYMENT DETAILS')
      .moveDown(0.6);

    const bookingDate = new Date(booking.bookingTime);
    const formattedDate = bookingDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = bookingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Booking Date & Time', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    doc
      .fontSize(12)
      .text(`${formattedDate}, ${formattedTime}`)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Amount Paid', { continued: false })
      .fillColor('#000000')
      .moveDown(0.2);

    const formattedPrice = booking.finalPrice.toLocaleString('en-IN');
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`₹${formattedPrice}`)
      .font('Helvetica')
      .moveDown(2.5);

    doc
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .strokeColor('#000000')
      .moveDown(1.5);

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#888888')
      .text('Please carry a valid photo ID for verification at the airport.', {
        align: 'center',
      })
      .moveDown(0.4)
      .text('This is a system-generated ticket and does not require a signature.', {
        align: 'center',
      })
      .fillColor('#000000');

    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

module.exports = {
  generateTicketPDF,
};
