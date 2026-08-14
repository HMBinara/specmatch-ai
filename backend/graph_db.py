import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
AUTH = (os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD"))


class GraphDB:
    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)

    def close(self):
        self.driver.close()

    def verify_connection(self):
        try:
            self.driver.verify_connectivity()
            print("[Neo4j] Connected successfully to local Docker container!")
        except Exception as e:
            print(f"[Neo4j] Connection failed: {e}")

    # ==========================================
    # 1. DUAL-WRITE: Add Developer & Skills
    # ==========================================
    def add_developer_node(self, company_id: str, developer_name: str, skills: list):
        """
        Creates Developer, Company, and Skill nodes and relationships:
        (Company)-[:EMPLOYS]->(Developer)-[:HAS_SKILL]->(Skill)
        """
        query = """
        MERGE (c:Company {id: $company_id})
        MERGE (d:Developer {id: $dev_id})
        ON CREATE SET d.name = $developer_name, d.company_id = $company_id
        ON MATCH SET d.name = $developer_name

        MERGE (c)-[:EMPLOYS]->(d)

        WITH d
        UNWIND $skills AS skill_name
        MERGE (s:Skill {name: toUpper(trim(skill_name))})
        MERGE (d)-[:HAS_SKILL]->(s)
        """
        dev_id = f"{company_id}_{developer_name}"

        with self.driver.session() as session:
            session.run(query, company_id=company_id, dev_id=dev_id, developer_name=developer_name, skills=skills)
        print(f"[Neo4j] Graph Nodes & Relationships created for {developer_name} with skills: {skills}")

    # ==========================================
    # 2. GRAPH RETRIEVAL: Exact / Structural Match
    # ==========================================
    def query_matching_developers(self, company_id: str, tech_stack: list) -> list:
        """
        Queries Neo4j for developers who have explicit relationships to requested skills.
        Returns matching developers and their verified skill count.
        """
        query = """
        MATCH (c:Company {id: $company_id})-[:EMPLOYS]->(d:Developer)-[:HAS_SKILL]->(s:Skill)
        WHERE toUpper(s.name) IN [skill IN $tech_stack | toUpper(trim(skill))]
        WITH d, count(s) AS matched_skills_count, collect(s.name) AS verified_skills
        RETURN d.name AS developer_name, matched_skills_count, verified_skills
        ORDER BY matched_skills_count DESC
        """

        with self.driver.session() as session:
            result = session.run(query, company_id=company_id, tech_stack=tech_stack)
            records = [record.data() for record in result]
            return records

    # ==========================================
    # 3. DELETE DEVELOPER (Safety & Multi-tenancy)
    # ==========================================
    def delete_developer_node(self, company_id: str, developer_name: str):
        dev_id = f"{company_id}_{developer_name}"
        query = """
        MATCH (d:Developer {id: $dev_id, company_id: $company_id})
        DETACH DELETE d
        """
        with self.driver.session() as session:
            session.run(query, dev_id=dev_id, company_id=company_id)
        print(f"[Neo4j] Deleted Developer Graph Node: {developer_name}")