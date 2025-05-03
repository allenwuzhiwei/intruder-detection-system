import React, { useEffect, useState } from "react";
import { Container, Button, Card, Pagination, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getValidAccessTokenOrRedirect } from "./auth";
import config from './config';

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 🔥 Add this line
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const fetchAlerts = async (pageNumber) => {
    setLoading(true);
    setError(""); // reset error on new fetch
    try {
      const token = getValidAccessTokenOrRedirect(navigate);
      if (!token) return;

      const response = await axios.get(
        `${config.API_BASE_URL}/api/alerts?page=${pageNumber}&size=${pageSize}&sortBy=alertDatetime&direction=desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.data;
      setAlerts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      if (error.response) {
        // Backend returned an error response (like 403)
        if (error.response.status !== 200) {
          setError(`Error ${error.response.status}: ${error.response.data}`);
        }
      }
      console.error("Error fetching alerts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="content">
      <Container>
        <h2>Alerts</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <Spinner animation="border" />
        ) : (
          alerts.map((alert, idx) => (
            <Card key={idx} className="mb-3">
              <Card.Body>
                <Card.Title>{alert.alertTitle}</Card.Title>
                <Card.Text>{alert.alertMessage}</Card.Text>
                <Card.Text>
                  <small className="text-muted">
                    Alert Date Time: {alert.alertDatetime}
                  </small>
                </Card.Text>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/alert-detail/${alert.alertId}`)}
                >
                  View Detail
                </Button>
              </Card.Body>
            </Card>
          ))
        )}

        {totalPages > 1 && (
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(0)} disabled={page === 0} />
            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={i === page}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1} />
            <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1} />
          </Pagination>
        )}
      </Container>
    </div>
  );
};

export default AlertsPage;
