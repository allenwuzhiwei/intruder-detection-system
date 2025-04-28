import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getValidAccessTokenOrRedirect } from "./auth";
import config from './config';

const AlertDetailPage = () => {
  const navigate = useNavigate();
  const { alertId } = useParams();
  const [alertDetails, setAlertDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
		  
		const token = getValidAccessTokenOrRedirect(navigate);
		if (!token) return; // getValidAccessTokenOrRedirect already navigates
		const response = await axios.get(
			`${config.API_BASE_URL}/api/alerts/${alertId}`,
			{
			  headers: {
				Authorization: `Bearer ${token}`,
			  },
			}
		);
        const alertData = response.data.data || [];
        setAlertDetails(alertData);
      } catch (error) {
      if (error.response) {
        // Backend returned an error response (like 403)
        if (error.response.status !== 200) {
          setError(`Error ${error.response.status}: ${error.response.data}`);
        }
      }
      console.error("Error fetching alert detail:", error);
    }
      setLoading(false);
    };

    fetchAlertDetails();
  }, [alertId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // Show error message
  }

  if (alertDetails.length === 0) {
    return <div>No alert detail found.</div>;
  }

  const first = alertDetails[0]; // general metadata

  // Formatting the timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Format date to readable string
  };

  return (
    <Container>
      <h2>{first.alertTitle || "Alert Detail"}</h2>
      <Card className="mb-3">
        <Card.Body>
		  <Card.Text>
            <strong>Title:</strong> {first.alertTitle}
          </Card.Text>
          <Card.Text>
            <strong>Message:</strong> {first.alertMessage}
          </Card.Text>
          <Card.Text>
            <strong>Type:</strong> {first.alertType}
          </Card.Text>
          <Card.Text>
            <strong>Severity:</strong> {first.severityLevel}
          </Card.Text>
          <Card.Text>
            <strong>Alert Date Time:</strong> {formatDate(first.alertDatetime)} {/* Formatted timestamp */}
          </Card.Text>

          {/* Images Section */}
          <h4 className="mt-4">Images</h4>
          <Row>
            {alertDetails
              .filter(item => item.fileFormat === "jpg") // Filter by jpg instead of "image"
              .map((img, index) => (
                <Col key={index} md={4} className="mb-3">
                  <Card>
                    <Card.Img
                      variant="top"
                      src={img.mediaUrl}
                      alt={`Image ${index + 1}`}
                    />
                  </Card>
                </Col>
              ))}
          </Row>

          {/* Videos Section */}
          <h4 className="mt-4">Videos</h4>
          <Row>
            {alertDetails
              .filter(item => item.fileFormat === "mp4") // Filter by mp4 instead of "video"
              .map((vid, index) => (
                <Col key={index} md={6} className="mb-3">
                  <Card>
                    <Card.Body>
                      <video controls className="w-100">
                        <source
                          src={vid.mediaUrl}
                          type={`Video/${vid.fileFormat}`}
                        />
                        Your browser does not support the video tag.
                      </video>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>

          {/* Back Button */}
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Back to Alerts
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AlertDetailPage;
