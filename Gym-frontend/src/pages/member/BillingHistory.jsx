import { useState, useEffect } from 'react';
import MemberLayout from '../../components/layouts/MemberLayout';
import { paymentAPI, memberAPI } from '../../services/api';
import { FiDownload, FiCalendar, FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

function BillingHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileResponse = await memberAPI.getProfile();
      setMemberProfile(profileResponse.data);

      const paymentsResponse = await paymentAPI.getMyPayments();
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (payment) => {
    setDownloading(payment._id);

    try {

      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text('TITAN FIT', 105, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(251, 191, 36);
      doc.text('INVOICE', 105, 32, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 38, 190, 38);


      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const invoiceTime = new Date(payment.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const invoiceNumber = `INV-${new Date(payment.createdAt).getFullYear()}${String(new Date(payment.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(payment.createdAt).getDate()).padStart(2, '0')}-${payment._id.slice(-6)}`;


      doc.text(`Invoice Number: ${invoiceNumber}`, 20, 50);
      doc.text(`Date: ${invoiceDate}`, 20, 58);
      doc.text(`Time: ${invoiceTime}`, 20, 66);
      doc.text(`Payment ID: ${payment.razorpayPaymentId?.slice(-12) || 'N/A'}`, 20, 74);


      doc.setTextColor(100, 100, 100);
      doc.text('Training Studio', 140, 50);
      doc.text('123 Fitness Street', 140, 58);
      doc.text('Gym City, 12345', 140, 66);


      doc.setDrawColor(200, 200, 200);
      doc.line(20, 82, 190, 82);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text('Bill To:', 20, 94);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const memberName = memberProfile?.userId?.name || memberProfile?.name || 'Valued Member';
      const memberEmail = memberProfile?.userId?.email || memberProfile?.email || 'member@gym.com';

      doc.text(memberName, 20, 102);
      doc.text(memberEmail, 20, 110);

      doc.line(20, 118, 190, 118);


      const startY = 128;

      doc.setFillColor(251, 191, 36);
      doc.rect(20, startY, 170, 10, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 25, startY + 7);
      doc.text('Plan', 85, startY + 7);
      doc.text('Amount (Rs.)', 125, startY + 7);
      doc.text('Status', 165, startY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFillColor(249, 250, 251);
      doc.rect(20, startY + 10, 170, 10, 'F');

      const planAmount = payment.amount / 100;
      const formattedAmount = planAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const description = `Gym Membership - ${new Date(payment.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;

      doc.setTextColor(60, 60, 60);
      doc.text(description.length > 25 ? description.substring(0, 22) + '...' : description, 25, startY + 17);
      doc.text(payment.plan || 'Membership', 85, startY + 17);
      doc.text(`Rs. ${formattedAmount}`, 125, startY + 17);
      doc.text(payment.status || 'SUCCESS', 165, startY + 17);


      doc.setDrawColor(200, 200, 200);
      doc.line(20, startY + 22, 190, startY + 22);

      const finalY = startY + 30;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Payment Status:', 20, finalY + 5);

      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94); // Green
      doc.setFont('helvetica', 'bold');
      doc.text('PAID', 70, finalY + 5);

      // TOTAL AMOUNT
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', 20, finalY + 20);
      doc.text(`Rs. ${formattedAmount}`, 85, finalY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(200, 200, 200);
      doc.line(20, finalY + 28, 190, finalY + 28);

      //FOOTER
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for choosing Training Studio!', 105, finalY + 40, { align: 'center' });
      doc.text('This is a computer generated invoice.', 105, finalY + 46, { align: 'center' });

      const generatedDate = new Date().toLocaleDateString('en-IN');
      const generatedTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Generated on: ${generatedDate} ${generatedTime}`, 105, finalY + 52, { align: 'center' });

      const fileName = `Invoice-${payment.plan}-${invoiceDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const downloadAllInvoices = () => {
    if (payments.length === 0) {
      toast.error('No invoices to download');
      return;
    }

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('TITAN FIT', 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(251, 191, 36);
      doc.text('Payment History Summary', 105, 32, { align: 'center' });

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 38, 190, 38);

      // Member info
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const memberName = memberProfile?.userId?.name || memberProfile?.name || 'Valued Member';
      const memberEmail = memberProfile?.userId?.email || memberProfile?.email || 'member@gym.com';

      doc.text(`Member: ${memberName}`, 20, 50);
      doc.text(`Email: ${memberEmail}`, 20, 58);
      doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 66);

      // Line separator
      doc.line(20, 72, 190, 72);

      // Table header
      doc.setFillColor(251, 191, 36); // Yellow
      doc.rect(20, 78, 170, 8, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 25, 84);
      doc.text('Plan', 65, 84);
      doc.text('Amount (Rs.)', 100, 84);  // Changed to Rs.
      doc.text('Status', 145, 84);

      doc.setFont('helvetica', 'normal');

      // Table rows
      let yPos = 92;
      payments.forEach((payment, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;

          // Repeat header on new page
          doc.setFillColor(251, 191, 36);
          doc.rect(20, yPos - 4, 170, 8, 'F');

          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Date', 25, yPos + 2);
          doc.text('Plan', 65, yPos + 2);
          doc.text('Amount (Rs.)', 100, yPos + 2);
          doc.text('Status', 145, yPos + 2);

          doc.setFont('helvetica', 'normal');
          yPos += 10;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // Light gray
          doc.rect(20, yPos - 2, 170, 8, 'F');
        }

        const date = new Date(payment.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const amount = payment.amount / 100;
        const formattedAmount = amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        doc.setTextColor(60, 60, 60);
        doc.text(date, 25, yPos + 2);
        doc.text(payment.plan || 'Membership', 65, yPos + 2);
        doc.text(`Rs. ${formattedAmount}`, 100, yPos + 2);  // Using Rs. instead of ₹
        doc.text(payment.status || 'SUCCESS', 145, yPos + 2);

        yPos += 8;
      });

      // Summary section
      const totalAmount = payments.reduce((sum, p) => sum + (p.amount / 100), 0);
      const formattedTotal = totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      yPos += 10;
      doc.line(20, yPos - 2, 190, yPos - 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Summary:', 20, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Payments: ${payments.length}`, 30, yPos + 16);
      doc.text(`Total Amount: Rs. ${formattedTotal}`, 30, yPos + 24);  // Using Rs. instead of ₹

      // Calculate average
      const avgAmount = totalAmount / payments.length;
      const formattedAvg = avgAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      doc.text(`Average Payment: Rs. ${formattedAvg}`, 30, yPos + 32);  // Using Rs. instead of ₹

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for choosing Training Studio!', 105, yPos + 50, { align: 'center' });
      doc.text('This is a computer generated summary.', 105, yPos + 56, { align: 'center' });

      const generatedDate = new Date().toLocaleDateString('en-IN');
      const generatedTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Generated on: ${generatedDate} ${generatedTime}`, 105, yPos + 62, { align: 'center' });

      // Save PDF
      const fileName = `Payment-History-${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast.success('Payment history downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      toast.error('Failed to download payment history');
    }
  };

  const getStatusIcon = (status) => {
    return status === 'SUCCESS' ?
      <FiCheckCircle className="text-green-500" /> :
      <FiXCircle className="text-red-500" />;
  };

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount / 100), 0);
  const lastPayment = payments.length > 0 ? payments[0] : null;

  return (
    <MemberLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Billing History</h1>
            {memberProfile && (
              <p className="text-gray-600 mt-1">
                {memberProfile.userId?.name || memberProfile.name}
              </p>
            )}
          </div>
          {payments.length > 0 && (
            <button
              onClick={downloadAllInvoices}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              <FiDownload />
              Download All
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Payments</div>
            <div className="text-3xl font-bold">{payments.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm text-green-600">Total Spent</div>
            <div className="text-3xl font-bold text-green-600">
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm text-yellow-600">Last Payment</div>
            <div className="text-3xl font-bold text-yellow-600">
              {lastPayment ? new Date(lastPayment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-blue-600">Membership</div>
            <div className="text-3xl font-bold text-blue-600">
              {memberProfile?.plan || 'N/A'}
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">No billing history found</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.plan === 'PREMIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ₹ {(payment.amount / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {payment.razorpayPaymentId?.slice(-8) || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm">
                        {getStatusIcon(payment.status)}
                        <span className={payment.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                          {payment.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => downloadInvoice(payment)}
                        disabled={downloading === payment._id}
                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-500 disabled:opacity-50"
                      >
                        <FiDownload />
                        {downloading === payment._id ? '...' : 'PDF'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MemberLayout>
  );
}

export default BillingHistory;